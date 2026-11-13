const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { BackendSupervisor } = require('../../electron/supervisor.cjs');
const { requestLocal } = require('../../electron/http.cjs');
const root = path.resolve(__dirname, '../..');
const python = process.env.MIKA_PYTHON || path.join(root, '.venv/Scripts/python.exe');
function supervisor(mode = 'ready', timeoutMs = 5000) {
  return new BackendSupervisor({ command: python,
    args: ['tests/fixtures/health_service.py', mode], cwd: root, timeoutMs });
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

test('real child handshake, duplicate start, auth, and graceful cleanup', async () => {
  const service = supervisor();
  try {
    await Promise.all([service.start(), service.start()]);
    const pid = service.child.pid;
    const port = service.port;
    assert.equal(service.snapshot().status, 'ready');
    assert.equal(JSON.stringify(service.snapshot()).includes(service.token), false);
    await assert.rejects(requestLocal(port, 'b'.repeat(64), '/health'));
    assert.equal((await service.request('/health')).offline, true);
    await Promise.all([service.stop(), service.stop()]);
    assert.equal(service.child, null); assert.equal(service.token, '');
    assert.throws(() => process.kill(pid, 0));
    await assert.rejects(requestLocal(port, 'a'.repeat(64), '/health'));
  } finally { await service.stop(); }
});

test('missing executable terminates startup without hanging', async () => {
  const service = new BackendSupervisor({ command: path.join(root, 'missing-python.exe'), args: [], cwd: root });
  await assert.rejects(service.start(), /Cannot launch Python/);
  assert.equal(service.status, 'error'); assert.equal(service.child, null);
});
for (const mode of ['fatal', 'junk', 'null', 'array', 'bad-health', 'timeout']) {
  test(`failed ${mode} startup cleans up its child`, async () => {
    const service = supervisor(mode, mode === 'timeout' ? 250 : 5000);
    try { await assert.rejects(service.start()); assert.equal(service.status, 'error'); assert.equal(service.child, null); }
    finally { await service.stop(); }
  });
}

test('unexpected service crash is reported and restart works', async () => {
  const service = supervisor('crash');
  try {
    await service.start();
    for (let i = 0; i < 40 && service.status === 'ready'; i++) await delay(50);
    assert.equal(service.status, 'error');
    service.options.args = ['tests/fixtures/health_service.py'];
    await service.start(); assert.equal(service.status, 'ready');
  } finally { await service.stop(); }
});

test('real bootstrap rejects invalid secrets without echoing them', async () => {
  const output = await new Promise((resolve, reject) => {
    const child = spawn(python, ['-m', 'backend.bootstrap'], { cwd: root, windowsHide: true });
    let result = '';
    child.stdout.on('data', chunk => { result += chunk; });
    child.on('error', reject); child.on('close', code => resolve({ code, result }));
    child.stdin.end('{"token":"private-sentinel"}\n');
  });
  assert.equal(output.code, 2); assert.match(output.result, /INVALID_BOOTSTRAP/);
  assert.doesNotMatch(output.result, /private-sentinel/);
});

test('production stdin watchdog exits child after its supervising parent is killed', async () => {
  const bridge = spawn(process.execPath, ['tests/fixtures/parent_bridge.cjs'], {
    cwd: root, windowsHide: true, shell: false,
  });
  let childPid;
  try {
    childPid = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Bridge startup timed out')), 5000);
      bridge.once('error', reject);
      let data = '';
      bridge.stdout.on('data', chunk => {
        data += chunk;
        if (data.includes('\n')) { clearTimeout(timer); resolve(JSON.parse(data.split('\n')[0]).pid); }
      });
    });
    bridge.kill();
    let alive = true;
    for (let index = 0; index < 100 && alive; index++) {
      await delay(50);
      try { process.kill(childPid, 0); } catch { alive = false; }
    }
    assert.equal(alive, false, 'Python child should exit on parent stdin EOF');
  } finally {
    bridge.kill();
    if (childPid) { try { process.kill(childPid); } catch { /* already exited */ } }
  }
});

test('production watchdog terminates a service even if its shutdown callback blocks', async () => {
  const service = supervisor('stubborn');
  try {
    await service.start(); const pid = service.child.pid;
    await service.stop();
    assert.equal(service.status, 'stopped');
    assert.throws(() => process.kill(pid, 0));
  } finally { await service.stop(); }
});
