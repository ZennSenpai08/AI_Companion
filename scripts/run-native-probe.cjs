const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const folder = path.join(root, 'test-artifacts/investigation');
fs.mkdirSync(folder, { recursive: true });
const executable = path.join(root, 'node_modules/electron/dist/electron.exe');
/** @type {NodeJS.ProcessEnv} */
const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
const child = spawn(executable, [path.join(__dirname, 'native-probe'),
  '--user-data-dir=' + path.join(folder, 'probe-user-data')], {
  cwd: root, windowsHide: true, shell: false, env,
});
let stdout = ''; let stderr = '';
const timer = setTimeout(() => { child.kill(); }, 15000);
child.stdout.on('data', chunk => { stdout += chunk; });
child.stderr.on('data', chunk => { stderr += chunk; });
child.on('error', error => { stderr += error.message; });
child.on('close', (code, signal) => {
  clearTimeout(timer);
  const report = { executed_at: new Date().toISOString(), executable,
    version: JSON.parse(fs.readFileSync(path.join(root, 'node_modules/electron/package.json'), 'utf8')).version,
    exitCode: code, signal, stdout, stderr, status: code === 0 ? 'PASSED' : 'BLOCKED' };
  fs.writeFileSync(path.join(folder, 'native-probe.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2)); process.exitCode = code === 0 ? 0 : 1;
});
