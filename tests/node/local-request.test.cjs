const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { requestLocal } = require('../../electron/http.cjs');
const { BackendSupervisor } = require('../../electron/supervisor.cjs');
const { developmentPython } = require('../../electron/python-runtime.cjs');
const { backendStage } = require('../../electron/diagnostics.cjs');
test('failed backend startup rejects preferences/history as not-ready, retaining useful setup error', async () => {
  const root = path.resolve(__dirname, '../..');
  const backend = new BackendSupervisor({ command: developmentPython(root).command,
    args: ['tests/fixtures/health_service.py', 'fatal'], cwd: root });
  await assert.rejects(backend.start(), /packages are missing/);
  for (const route of ['/preferences', '/messages']) {
    await assert.rejects(backend.request(route), error => error.code === 'BACKEND_NOT_READY' && /packages are missing/.test(error.message));
  }
  assert.equal(backend.port, 0); assert.equal(backend.token, '');
});
test('low-level guard still rejects invalid ports, credentials, paths and request bodies without values', async () => {
  for (const [port, token, route, body, code] of [
    [0, '', '/messages', null, 'INVALID_LOCAL_PORT'],
    [11434, 'private-secret-do-not-log', '/preferences', null, 'INVALID_LOCAL_CREDENTIAL'],
    [11434, 'a'.repeat(64), 'http://external.test/health', null, 'INVALID_LOCAL_ROUTE'],
    [11434, 'a'.repeat(64), '/health', {}, 'INVALID_LOCAL_BODY'],
    [11434, 'a'.repeat(64), '/preferences', [], 'INVALID_LOCAL_BODY'],
  ]) await assert.rejects(requestLocal(port, token, route, body), error => {
    assert.equal(error.code, code); assert.doesNotMatch(error.message, /private-secret|external.test|aaaa/); return true;
  });
});
test('normal launch and smoke use the prepared runtime while respecting explicit Python', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mika-python-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('mika-python-')); fs.rmSync(root, { recursive: true });
  });
  assert.equal(developmentPython(root, {}).source, 'setup-venv');
  const prepared = path.join(root, '.venv-runtime/Scripts/python.exe');
  fs.mkdirSync(path.dirname(prepared), { recursive: true }); fs.writeFileSync(prepared, 'fixture');
  assert.equal(developmentPython(root, {}).command, prepared);
  assert.equal(developmentPython(root, { MIKA_PYTHON: 'chosen-python' }).command, 'chosen-python');
});
test('diagnostics discard private stderr and nonallowlisted JSON fields', () => {
  assert.equal(backendStage('private traceback and token'), null);
  assert.equal(backendStage('MIKA_STAGE {"stage":"private-prompt","at":"2026-11-14T00:00:00Z"}'), null);
  const value = backendStage('MIKA_STAGE {"stage":"ollama_request","at":"2026-11-14T00:00:00Z","token":"private-secret","text":"private prompt"}');
  assert.deepEqual(value, { stage: 'ollama_request', at: '2026-11-14T00:00:00Z' });
  assert.equal(backendStage('MIKA_STAGE null'), null);
});
test('prepared normal-launch runtime serves authenticated preferences/messages and restart cleanly', async () => {
  const root = path.resolve(__dirname, '../..');
  const directory = path.join(root, 'test-artifacts/backend-runtime'); fs.mkdirSync(directory, { recursive: true });
  const dataDir = fs.mkdtempSync(path.join(directory, 'default-python-'));
  const backend = new BackendSupervisor({ command: developmentPython(root, {}).command,
    args: ['-m', 'backend.bootstrap'], cwd: root, dataDir });
  try {
    await backend.start();
    assert.equal((await backend.request('/preferences')).model, 'qwen3.5:0.8b');
    assert.deepEqual((await backend.request('/messages')).messages, []);
    await backend.request('/preferences', { language: 'taglish' });
    await assert.rejects(requestLocal(backend.port, 'b'.repeat(64), '/messages'));
    await backend.stop();
    await assert.rejects(backend.request('/messages'), { code: 'BACKEND_NOT_READY' });
    await backend.start(); assert.equal((await backend.request('/preferences')).language, 'taglish');
  } finally { await backend.stop(); }
});
