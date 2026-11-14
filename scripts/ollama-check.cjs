const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const { default_model: MODEL, models: modelPolicy } = /** @type {{default_model:string, models: Record<string, {min_free_gib:number}>}} */ (require('../backend/llm/model_policy.json'));
/** Fixed loopback metadata only. Never downloads weights or invokes inference.
 * @param {'version'|'tags'|'ps'|'show'} endpoint
 * @param {string} [model]
 * @returns {Promise<Record<string, any>>}
 */
function metadata(endpoint, model = MODEL) {
  return new Promise((resolve, reject) => {
    const body = endpoint === 'show' ? JSON.stringify({ model }) : null;
    let total = 0; let raw = '';
    const request = http.request({ hostname: '127.0.0.1', port: 11434,
      path: '/api/' + endpoint, method: body ? 'POST' : 'GET', agent: false,
      headers: body ? { 'Content-Type': 'application/json' } : {} }, response => {
      if (response.statusCode !== 200) { response.resume(); reject(new Error(`Local Ollama /${endpoint} returned HTTP ${response.statusCode}.`)); return; }
      response.setEncoding('utf8');
      response.on('data', chunk => {
        total += Buffer.byteLength(chunk);
        if (total > 1024 * 1024) request.destroy(new Error('Ollama metadata exceeded 1 MiB.'));
        else raw += chunk;
      });
      response.on('error', reject);
      response.on('end', () => {
        try {
          const value = JSON.parse(raw);
          if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid metadata object.');
          resolve(value);
        } catch { reject(new Error('Invalid Ollama metadata.')); }
      });
    });
    // Absolute deadline, not a timer extended by a trickle of bytes.
    const timer = setTimeout(() => request.destroy(new Error('Local Ollama metadata timed out.')), 3000);
    request.on('error', reject); request.on('close', () => clearTimeout(timer));
    request.end(body);
  });
}

/** @param {string} output */
function parseListeners(output) {
  const addresses = output.split(/\r?\n/).flatMap(line => {
    const columns = line.trim().split(/\s+/);
    return columns[0] === 'TCP' && /:11434$/.test(columns[1] ?? '') &&
      columns.some(part => part === 'LISTENING') ? [columns[1]] : [];
  });
  return { addresses, loopbackOnly: addresses.length > 0 &&
    addresses.every(address => address === '127.0.0.1:11434' || address === '[::1]:11434') };
}
function hardware() {
  /** @type {Record<string, unknown>} */
  const value = { totalRamBytes: os.totalmem(), freeRamBytes: os.freemem() };
  try { const disk = fs.statfsSync(path.resolve(__dirname, '..')); value.diskFreeBytes = disk.bavail * disk.bsize; } catch { /* Unknown, never invented. */ }
  try {
    value.gpuCsv = execFileSync('nvidia-smi', ['--query-gpu=name,memory.total,memory.used,memory.free,driver_version',
      '--format=csv,noheader,nounits'], { encoding: 'utf8', timeout: 3000, maxBuffer: 8192, windowsHide: true }).trim();
  } catch { value.gpuCsv = null; }
  return value;
}
async function checkOllama(model = MODEL) {
  const machine = hardware();
  /** @type {Record<string, any>} */
  const report = { checkedAt: new Date().toISOString(), model, hardware: machine,
    modelInferenceAttempted: false, modelDownloaded: false, listener: null,
    available: false, readyForRealTest: false, blockers: [] };
  try {
    if (process.platform !== 'win32') throw new Error('Inspect listener binding manually on this platform.');
    const output = execFileSync('netstat', ['-ano', '-p', 'tcp'],
      { encoding: 'utf8', timeout: 5000, maxBuffer: 4 * 1024 * 1024, windowsHide: true });
    report.listener = parseListeners(output);
  } catch { report.blockers.push('Loopback-only listener binding could not be verified.'); }
  if (!report.listener?.loopbackOnly) report.blockers.push('No verified loopback-only listener on port 11434.');
  const results = await Promise.allSettled(['version', 'tags', 'ps'].map(endpoint => metadata(/** @type {'version'|'tags'|'ps'} */ (endpoint))));
  for (let i = 0; i < results.length; i++) {
    const item = results[i]; const name = ['version', 'tags', 'ps'][i];
    if (item.status === 'fulfilled') report[name] = item.value;
    else report.blockers.push(item.reason instanceof Error ? item.reason.message : 'Local metadata unavailable.');
  }
  report.available = typeof report.version?.version === 'string' && Array.isArray(report.tags?.models);
  if (!report.available) report.blockers.push('Ollama version/catalog is unavailable or invalid.');
  const selected = Array.isArray(report.tags?.models) ? report.tags.models.find(
    /** @param {any} item */ item => item?.name === model) : null;
  if (!selected) report.blockers.push(`Model ${model} is not confirmed installed. Prepare it separately; no pull is automatic.`);
  else {
    if (!Number.isSafeInteger(selected.size) || selected.size <= 0 ||
        typeof selected.digest !== 'string' || !/^[a-f0-9]{64}$/i.test(selected.digest))
      report.blockers.push('Installed model size/digest metadata is invalid.');
    report.selected = { name: selected.name, digest: selected.digest, sizeBytes: selected.size, details: selected.details };
    try {
      const show = await metadata('show', model);
      report.modelDetails = show.details;
      report.modelLicense = typeof show.license === 'string' ? show.license : null;
      if (show.remote_host || show.remote_model || show.details?.format !== 'gguf')
        report.blockers.push('Selected model is not verified as local GGUF weights; remote/unknown models are refused.');
    } catch (error) { report.blockers.push(error instanceof Error ? error.message : 'Model details unavailable.'); }
  }
  const minimum = Object.hasOwn(modelPolicy, model) ? modelPolicy[model].min_free_gib : null;
  if (minimum === null || typeof machine.freeRamBytes !== 'number' || machine.freeRamBytes < minimum * 2 ** 30)
    report.blockers.push(`Unsupported model or insufficient RAM: ${minimum ?? 'unknown'} GiB required, matching Mika admission.`);
  report.readyForRealTest = report.available && report.blockers.length === 0;
  return report;
}
if (require.main === module) void checkOllama(process.env.MIKA_TEST_MODEL ?? MODEL).then(report => {
  console.log(JSON.stringify(report, null, 2)); process.exitCode = report.readyForRealTest ? 0 : 1;
}).catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { checkOllama, parseListeners, hardware, metadata, MODEL };
