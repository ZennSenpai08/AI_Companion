const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { randomUUID } = require('node:crypto');
const { assessVisibleProbe } = require('./native-probe-results.cjs');

if (process.argv.slice(2).includes('--help')) {
  console.log('Run from ordinary Windows PowerShell: node scripts/run-visible-native-probe.cjs');
  console.log('Close the native test window manually. Results are saved under test-artifacts/electron-startup/.');
} else {
  if (process.argv.length !== 2) throw new Error('No runtime flags are accepted by this visible test.');
  const root = path.resolve(__dirname, '..');
  const executable = path.join(root, 'node_modules/electron/dist/electron.exe');
  if (!fs.existsSync(executable)) throw new Error('Verified project Electron runtime is missing.');
  const version = JSON.parse(fs.readFileSync(path.join(root, 'node_modules/electron/package.json'), 'utf8')).version;
  const folder = path.join(root, 'test-artifacts/electron-startup',
    'visible-' + new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomUUID().slice(0, 8));
  fs.mkdirSync(folder, { recursive: true });
  const stdoutFile = path.join(folder, 'stdout.log');
  const stderrFile = path.join(folder, 'stderr.log');
  fs.writeFileSync(stdoutFile, '', { flag: 'wx' }); fs.writeFileSync(stderrFile, '', { flag: 'wx' });
  /** @type {NodeJS.ProcessEnv} */
  const env = { ...process.env, MIKA_VISIBLE_PROBE_ARTIFACT_DIR: folder,
    MIKA_VISIBLE_PROBE_VERSION: version };
  delete env.ELECTRON_RUN_AS_NODE; delete env.NODE_OPTIONS;
  const args = [path.join(__dirname, 'visible-native-probe'), '--enable-logging=file',
    '--log-file=' + path.join(folder, 'chromium.log'), '--log-level=0', '--v=1',
    '--user-data-dir=' + path.join(folder, 'user-data')];
  // GUI visibility is intentional. No token, desktop, job or security-policy changes.
  const child = spawn(executable, args, { cwd: root, env, shell: false,
    windowsHide: false, stdio: ['ignore', 'pipe', 'pipe'] });
  const base = { startedAt: new Date().toISOString(), executable, args, cwd: root,
    hostNode: process.version, account: os.userInfo().username, expectedElectron: version,
    pid: child.pid, stdoutFile, stderrFile, automaticClose: false,
    userAppearanceConfirmation: 'PENDING' };
  const reportFile = path.join(folder, 'visible-native-probe.json');
  fs.writeFileSync(reportFile, JSON.stringify({ ...base, status: 'RUNNING' }, null, 2));
  console.log('Visible native test: close the window manually when you have checked its appearance.');
  console.log('Results:', reportFile);
  child.stdout.on('data', chunk => { fs.appendFileSync(stdoutFile, chunk); process.stdout.write(chunk); });
  child.stderr.on('data', chunk => { fs.appendFileSync(stderrFile, chunk); process.stderr.write(chunk); });
  let interrupted = false;
  const stop = () => { interrupted = true; child.kill(); };
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
  child.on('error', error => { fs.appendFileSync(stderrFile, error.message + '\n'); });
  child.on('close', (exitCode, signal) => {
    process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop);
    const file = path.join(folder, 'stages.jsonl');
    const stages = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim().split('\n').map(line => JSON.parse(line)) : [];
    const assessment = assessVisibleProbe({ stages, exitCode, signal, interrupted });
    const report = { ...base, finishedAt: new Date().toISOString(), exitCode, signal,
      interrupted, stages, ...assessment,
      scope: 'Programmatic window/security/close checks; user confirms appearance separately.' };
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ artifact: reportFile, ...report }, null, 2));
    process.exitCode = interrupted ? 130 : assessment.status === 'AUTOMATED_CHECKS_PASSED' ? 0 : 1;
  });
}
