const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const software = process.argv.slice(2).includes('--software');
if (process.argv.slice(2).some(argument => argument !== '--software')) throw new Error('Unknown probe option');
const folder = path.join(root, 'test-artifacts/electron-startup',
  new Date().toISOString().replace(/[:.]/g, '-') + '-' + require('node:crypto').randomUUID().slice(0, 8));
fs.mkdirSync(folder, { recursive: true });
const executable = path.join(root, 'node_modules/electron/dist/electron.exe');
/** @type {NodeJS.ProcessEnv} */
const env = { ...process.env, MIKA_PROBE_ARTIFACT_DIR: folder,
  MIKA_PROBE_SOFTWARE_RENDERING: software ? '1' : '0' };
delete env.ELECTRON_RUN_AS_NODE; delete env.NODE_OPTIONS;
const args = [path.join(__dirname, 'native-probe'), '--enable-logging=file',
  '--log-file=' + path.join(folder, 'chromium.log'), '--log-level=0', '--v=1',
  '--user-data-dir=' + path.join(folder, 'probe-user-data')];
const child = spawn(executable, args, {
  cwd: root, windowsHide: true, shell: false, env,
});
const observerPython = path.join(root, '.venv-runtime/Scripts/python.exe');
const observerFile = path.join(folder, 'processes.json');
let observerError = '';
let observerDone = Promise.resolve();
if (child.pid && fs.existsSync(observerPython)) {
  const observer = spawn(observerPython, [path.join(__dirname, 'electron_process_watch.py'),
    String(child.pid), observerFile], { cwd: root, shell: false, windowsHide: true });
  observer.stderr.on('data', chunk => { observerError += chunk; });
  observerDone = new Promise(resolve => {
    observer.on('close', () => resolve());
    observer.on('error', error => { observerError += error.message; resolve(); });
  });
}
let stdout = ''; let stderr = ''; let timedOut = false;
const timer = setTimeout(() => { timedOut = true; child.kill(); }, 15000);
child.stdout.on('data', chunk => { stdout += chunk; });
child.stderr.on('data', chunk => { stderr += chunk; });
child.on('error', error => { stderr += error.message; });
child.on('close', async (code, signal) => {
  clearTimeout(timer);
  await observerDone;
  const processes = fs.existsSync(observerFile) ? JSON.parse(fs.readFileSync(observerFile, 'utf8')) : null;
  const stagesFile = path.join(folder, 'stages.jsonl');
  const stages = fs.existsSync(stagesFile) ? fs.readFileSync(stagesFile, 'utf8').trim().split('\n').map(line => JSON.parse(line)) : [];
  const events = stages.map(stage => stage.event);
  const success = code === 0 && !timedOut && ['main-entered', 'app-ready', 'renderer-ready',
    'window-visible', 'content-captured', 'window-closed', 'quit'].every(event => events.includes(event)) &&
    stages.some(stage => stage.event === 'window-visible' && stage.visible === true) &&
    stages.some(stage => stage.event === 'content-captured' && stage.empty === false) &&
    processes?.remaining_observed_pids.length === 0;
  const report = { executed_at: new Date().toISOString(), executable, args, cwd: root,
    hostNode: process.version, softwareRendering: software, pid: child.pid, timedOut,
    stages, processes, observerFile, observerError,
    version: JSON.parse(fs.readFileSync(path.join(root, 'node_modules/electron/package.json'), 'utf8')).version,
    exitCode: code, signal, stdout, stderr, status: success ? 'PASSED' : 'BLOCKED' };
  fs.writeFileSync(path.join(folder, 'native-probe.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ artifact: path.join(folder, 'native-probe.json'), ...report }, null, 2));
  process.exitCode = success ? 0 : 1;
});
