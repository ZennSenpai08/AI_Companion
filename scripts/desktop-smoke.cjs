const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const root = path.resolve(__dirname, '..');
const destination = path.join(root, 'test-artifacts/desktop');
/** @type {NodeJS.ProcessEnv} */
const env = { ...process.env, MIKA_SMOKE_TEST: '1', MIKA_DATA_DIR: destination };
delete env.ELECTRON_RUN_AS_NODE;
const executable = path.join(root, 'node_modules/electron/dist/electron.exe');
if (!fs.existsSync(executable)) throw new Error('Electron runtime missing. Run setup first.');
const child = spawn(executable, ['.'], { cwd: root, env, windowsHide: true, stdio: 'inherit', shell: false });
const timer = setTimeout(() => {
  console.error('Desktop smoke timed out. No desktop acceptance claimed.');
  if (child.pid) spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, shell: false });
  process.exitCode = 1;
}, 30000);
child.on('error', error => { clearTimeout(timer); console.error(error.message); process.exitCode = 1; });
child.on('exit', code => {
  clearTimeout(timer);
  process.exitCode = code ?? 1;
  if (code === 0) {
    const reportPath = path.join(destination, 'desktop-smoke.json');
    if (!fs.existsSync(reportPath)) { console.error('No smoke report written.'); process.exitCode = 1; }
    else console.log(fs.readFileSync(reportPath, 'utf8'));
  }
});
