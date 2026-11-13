const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const net = require('node:net');
const { assessDesktopReport } = require('./desktop-acceptance.cjs');
const root = path.resolve(__dirname, '..');
if (!['dist/index.html', 'dist/overlay.html'].every(file => fs.existsSync(path.join(root, file)))) {
  console.error('Actual Mika acceptance requires both built Vue pages. Run npm run build first.');
  process.exit(1);
}
const destination = path.join(root, 'test-artifacts/electron-startup',
  'mika-' + new Date().toISOString().replace(/[:.]/g, '-') + '-' + require('node:crypto').randomUUID().slice(0, 8));
fs.mkdirSync(destination, { recursive: true });
/** @type {NodeJS.ProcessEnv} */
const env = { ...process.env, MIKA_SMOKE_TEST: '1', MIKA_DATA_DIR: destination };
if (!env.MIKA_PYTHON) {
  const prepared = path.join(root, '.venv-runtime/Scripts/python.exe');
  if (fs.existsSync(prepared)) env.MIKA_PYTHON = prepared;
}
delete env.ELECTRON_RUN_AS_NODE;
delete env.NODE_OPTIONS;
const executable = path.join(root, 'node_modules/electron/dist/electron.exe');
if (!fs.existsSync(executable)) throw new Error('Electron runtime missing. Run setup first.');
const args = ['.', '--enable-logging=file', '--log-file=' + path.join(destination, 'chromium.log'),
  '--log-level=0', '--v=1'];
const child = spawn(executable, args, { cwd: root, env, windowsHide: false, shell: false });
let stdout = ''; let stderr = ''; let timedOut = false;
child.stdout.on('data', chunk => { stdout += chunk; });
child.stderr.on('data', chunk => { stderr += chunk; });
const timer = setTimeout(() => {
  timedOut = true;
  console.error('Desktop smoke timed out. No desktop acceptance claimed.');
  if (child.pid) spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, shell: false });
  process.exitCode = 1;
}, 30000);
child.on('error', error => { clearTimeout(timer); console.error(error.message); process.exitCode = 1; });
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
  const reportPath = path.join(destination, 'desktop-smoke.json');
  const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : null;
  const checks = assessDesktopReport(report);
  const backendProcessGone = processGone(report?.supervision?.backendPid);
  const backendListenerClosed = await listenerClosed(report?.supervision?.backendPort);
  const gracefulShutdown = code === 0 && !signal && !timedOut && backendProcessGone === true && backendListenerClosed === true;
  const success = gracefulShutdown && Object.values(checks).every(value => value === true) &&
    fs.existsSync(path.join(destination, 'desktop-preview.png'));
  const launch = { executed_at: new Date().toISOString(), executable, args, cwd: root,
    hostNode: process.version, pid: child.pid, code, signal, timedOut, stdout, stderr,
    checks, backendProcessGone, backendListenerClosed,
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
