const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const net = require('node:net');
const { assessDesktopReport } = require('./desktop-acceptance.cjs');
const { resolveElectronRuntime, describeLaunchError } = require('./electron-runtime.cjs');
const { developmentPython } = require('../electron/python-runtime.cjs');
const root = path.resolve(__dirname, '..');
const realChat = process.argv.includes('--real-chat');
/** @type {ReturnType<typeof resolveElectronRuntime>} */
let runtime;
try { runtime = resolveElectronRuntime(root); }
catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); }
if (!['dist/index.html', 'dist/overlay.html'].every(file => fs.existsSync(path.join(root, file)))) {
  console.error('Actual Mika acceptance requires both built Vue pages. Run npm run build first.');
  process.exit(1);
}
const destination = path.join(root, 'test-artifacts/electron-startup',
  'mika-' + new Date().toISOString().replace(/[:.]/g, '-') + '-' + require('node:crypto').randomUUID().slice(0, 8));
fs.mkdirSync(destination, { recursive: true });
// Explicit real-model mode fails closed before Electron/inference when unavailable.
if (realChat) {
  void require('./ollama-check.cjs').checkOllama(process.env.MIKA_TEST_MODEL).then(report => {
    fs.writeFileSync(path.join(destination, 'ollama-preflight.json'), JSON.stringify(report, null, 2));
    if (!report.readyForRealTest) {
      console.error(JSON.stringify({ artifact: path.join(destination, 'ollama-preflight.json'),
        status: 'BLOCKED', inferenceAttempted: false, blockers: report.blockers }, null, 2));
      process.exitCode = 1;
    } else launch();
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
} else launch();

function launch() {
/** @type {NodeJS.ProcessEnv} */
const env = { ...process.env, MIKA_SMOKE_TEST: '1', MIKA_DATA_DIR: destination };
if (realChat) env.MIKA_REAL_CHAT_TEST = '1';
else delete env.MIKA_REAL_CHAT_TEST;
if (!env.MIKA_PYTHON) {
  env.MIKA_PYTHON = developmentPython(root, env).command;
}
delete env.ELECTRON_RUN_AS_NODE;
delete env.NODE_OPTIONS;
const { executable } = runtime;
const args = ['.', '--enable-logging=file', '--log-file=' + path.join(destination, 'chromium.log'),
  '--log-level=0', '--v=1'];
const child = spawn(executable, args, { cwd: root, env, windowsHide: false, shell: false });
/** @type {Array<Record<string, unknown>>} */
const resourceSamples = [];
const sample = () => resourceSamples.push({ sampledAt: new Date().toISOString(), ...require('./ollama-check.cjs').hardware() });
const resourceTimer = realChat ? setInterval(sample, 2500) : null;
if (realChat) sample();
let stdout = ''; let stderr = ''; let timedOut = false;
/** @type {string|null} */
let nativeSpawnError = null;
child.stdout.on('data', chunk => { stdout += chunk; });
child.stderr.on('data', chunk => { stderr += chunk; });
const timer = setTimeout(() => {
  timedOut = true;
  console.error('Desktop smoke timed out. No desktop acceptance claimed.');
  if (child.pid) spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, shell: false });
  process.exitCode = 1;
}, realChat ? 10 * 60 * 1000 : 30000);
child.on('error', error => {
  if (resourceTimer) clearInterval(resourceTimer);
  clearTimeout(timer); nativeSpawnError = describeLaunchError(error, executable);
  console.error(nativeSpawnError); process.exitCode = 1;
});
/** @param {number|undefined} port @returns {Promise<boolean|null>} */
function listenerClosed(port) {
  if (!Number.isInteger(port) || !port || port < 1 || port > 65535) return Promise.resolve(null);
  return new Promise(resolve => {
    const socket = net.connect({ host: '127.0.0.1', port });
    /** @param {boolean|null} value */
    const finish = value => { socket.destroy(); resolve(value); };
    socket.once('connect', () => finish(false));
    socket.once('error', error => finish('code' in error && error.code === 'ECONNREFUSED' ? true : null));
    socket.setTimeout(1500, () => finish(null));
  });
}
/** @param {number|undefined} pid */
function processGone(pid) {
  if (!Number.isInteger(pid) || !pid || pid < 1) return null;
  try { process.kill(pid, 0); return false; }
  catch (error) { return error instanceof Error && 'code' in error && error.code === 'ESRCH' ? true : null; }
}
child.on('close', async (code, signal) => {
  clearTimeout(timer);
  if (resourceTimer) clearInterval(resourceTimer);
  if (realChat) fs.writeFileSync(path.join(destination, 'resource-samples.json'), JSON.stringify({
    scope: 'Approximate whole-system RAM and GPU usage, not model-process-only; sampled every 2.5 s',
    gpuCsvUnits: 'name,total MiB,used MiB,free MiB,driver', samples: resourceSamples }, null, 2));
  const reportPath = path.join(destination, 'desktop-smoke.json');
  const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : null;
  if (realChat) {
    try {
      const loaded = await require('./ollama-check.cjs').metadata('ps');
      fs.writeFileSync(path.join(destination, 'ollama-loaded-after.json'), JSON.stringify(loaded, null, 2));
    } catch { /* Loaded-model memory is unknown if the external daemon stopped. */ }
  }
  const checks = assessDesktopReport(report);
  const backendProcessGone = processGone(report?.supervision?.backendPid);
  const backendListenerClosed = await listenerClosed(report?.supervision?.backendPort);
  const gracefulShutdown = code === 0 && !signal && !timedOut && backendProcessGone === true && backendListenerClosed === true;
  const overlayCaptionVerified = report?.overlayCaption?.phase === 'complete' &&
    report.overlayCaption.audioActive === false && report.overlayCaption.nonempty === true && report.overlayCaption.matches === true;
  const success = gracefulShutdown && Object.values(checks).every(value => value === true) &&
    (!realChat || (report?.realChat?.transportStatus === 'PASS' && overlayCaptionVerified)) &&
    fs.existsSync(path.join(destination, 'desktop-preview.png'));
  const launch = { executed_at: new Date().toISOString(), executable, args, cwd: root,
    hostNode: process.version, runtimeVersion: runtime.version, runtimeResolved: true,
    nativeSpawnError, realChatRequested: realChat,
    overlayCaptionVerified: realChat ? overlayCaptionVerified : null,
    realChatStatus: realChat ? report?.realChat?.transportStatus ?? 'NOT VERIFIED' : 'NOT REQUESTED',
    languageQuality: realChat ? 'REQUIRES HUMAN REVIEW' : 'NOT TESTED',
    externalNetworkIsolation: 'NOT VERIFIED by this smoke test',
    pid: child.pid, code, signal, timedOut, stdout, stderr,
    checks, backendProcessGone, backendListenerClosed,
    rendererStartup: checks.overlayVueAndPreload && checks.panelVueAndPreload &&
      checks.overlayVisibleAndSecure && checks.panelVisibleAndSecure ? 'PASS' : 'NOT VERIFIED',
    gracefulShutdown: gracefulShutdown ? 'PASS' : 'NOT VERIFIED',
    status: success ? 'PASSED' : 'BLOCKED' };
  fs.writeFileSync(path.join(destination, 'launch.json'), JSON.stringify(launch, null, 2));
  process.exitCode = success ? 0 : 1;
  console.log(JSON.stringify({ artifact: path.join(destination, 'launch.json'), ...launch }, null, 2));
  if (code === 0) {
    if (!fs.existsSync(reportPath)) { console.error('No smoke report written.'); process.exitCode = 1; }
    else console.log(fs.readFileSync(reportPath, 'utf8'));
  }
});
}
