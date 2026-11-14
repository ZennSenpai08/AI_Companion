const { spawn } = require('node:child_process');
const path = require('node:path');
const { resolveElectronRuntime, describeLaunchError } = require('./electron-runtime.cjs');
const root = path.resolve(__dirname, '..');
// Preflight before Vite so a missing native runtime leaves no dev server running.
let runtime;
try { runtime = resolveElectronRuntime(root); }
catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); }
if (process.env.MIKA_SMOKE_TEST === '1')
  console.warn('MIKA_SMOKE_TEST=1 is inherited: Mika will run its automated checks and quit. For interactive use, remove that variable in this PowerShell session.');
const vite = spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js')], {
  cwd: root, stdio: 'inherit', shell: false, windowsHide: true,
});
/** @type {import('node:child_process').ChildProcess | undefined} */
let desktop;
let stopped = false;
function stop() { if (stopped) return; stopped = true; desktop?.kill(); vite.kill(); }
process.on('SIGINT', stop); process.on('SIGTERM', stop);
process.on('exit', stop);
vite.on('error', () => { console.error('Vite could not start. Run setup first.'); stop(); process.exitCode = 1; });
vite.on('exit', (code, signal) => {
  const expected = stopped;
  stop();
  if (!expected) {
    console.error(`Vite exited before the dev session ended: code=${code}, signal=${signal ?? 'none'}. This is a frontend-server error, not an Electron runtime diagnosis.`);
    process.exitCode = code || 1;
  }
});
(async () => {
  for (let attempt = 0; attempt < 60 && !stopped; attempt++) {
    try {
      const response = await fetch('http://127.0.0.1:5173', { signal: AbortSignal.timeout(500) });
      if (response.ok) {
        const { executable } = runtime;
        /** @type {NodeJS.ProcessEnv} */
        const env = { ...process.env, MIKA_DEV: '1' }; delete env.ELECTRON_RUN_AS_NODE;
        // Electron owns visible desktop windows; do not inherit a SW_HIDE startup request.
        desktop = spawn(executable, ['.'], { cwd: root, stdio: 'inherit', env, windowsHide: false, shell: false });
        desktop.on('error', error => { console.error(describeLaunchError(error, executable)); stop(); process.exitCode = 1; });
        desktop.on('exit', (code, signal) => {
          console.log(`Electron exited: code=${code}, signal=${signal ?? 'none'}. An interrupted exit does not negate prior renderer startup.`);
          stop(); process.exitCode = code ?? 1;
        });
        return;
      }
    } catch { /* Wait for Vite; only the fixed local port is contacted. */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  if (!stopped) { console.error('Vite did not become ready on 127.0.0.1:5173'); stop(); process.exitCode = 1; }
})();
