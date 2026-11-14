const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { performance } = require('node:perf_hooks');
const { verifyRealChat } = require('../../electron/real-chat-test.cjs');

// Failure-report fixtures only: never an actual Electron/model acceptance run.
function panel(bridge, globals = {}) {
  return { webContents: { executeJavaScript: script => vm.runInNewContext(script,
    { window: { mika: bridge }, performance, setTimeout, clearTimeout, console, ...globals }) } };
}
test('failed backend readiness retains the attempted case and precise stage instead of empty turns', async () => {
  const result = await verifyRealChat(panel({ status: async () => ({ backend: { status: 'error' } }) }));
  assert.equal(result.transportStatus, 'FAIL'); assert.equal(result.turns.length, 1);
  assert.equal(result.failureStage, 'backend-readiness'); assert.equal(result.code, 'BACKEND_NOT_READY');
});
function interruptedPanel(events) {
  let listener = () => {};
  const input = { disabled: false, value: '', dispatchEvent() {} };
  const select = { value: '', dispatchEvent() {} };
  const send = { disabled: false, click() { for (const event of events) listener(event); } };
  const area = { dataset: { initState: 'ready' }, hasAttribute: () => true,
    querySelectorAll: selector => selector === 'select' ? [select, { ...select }] : [],
    querySelector: selector => selector === '#message' ? input : selector === '.error' ? { textContent: '' } : send };
  const bridge = { status: async () => ({ backend: { status: 'ready' } }),
    preferences: async () => ({}), messages: async () => ({ messages: [] }),
    onChatEvent(callback) { listener = callback; return () => {}; } };
  return panel(bridge, { Event: class {}, document: {
    querySelectorAll: () => [{ textContent: 'chat', click() {} }], querySelector: () => area } });
}
test('interrupted first-token wait reports cancellation immediately instead of a 100-second evidence timeout', async () => {
  const start = performance.now();
  const result = await verifyRealChat(interruptedPanel([
    { type: 'state', state: 'THINKING', sequence: 1 },
    { type: 'state', state: 'INTERRUPTED', sequence: 2 },
  ]));
  assert.equal(result.code, 'CHAT_INTERRUPTED'); assert.equal(result.turns.length, 1);
  assert.ok(performance.now() - start < 1000);
});
test('a replacement turn is identified as test interference without accepting its evidence', async () => {
  const result = await verifyRealChat(interruptedPanel([
    { type: 'state', state: 'THINKING', sequence: 1 },
    { type: 'state', state: 'THINKING', sequence: 2 },
  ]));
  assert.equal(result.code, 'TEST_INTERFERED'); assert.equal(result.turns[0].completed, false);
});
test('local bootstrap rejection is distinguished from waiting for a model token', async () => {
  const result = await verifyRealChat(panel({ status: async () => ({ backend: { status: 'ready' } }),
    preferences: async () => { throw Object.assign(new Error('Invalid local request'), { code: 'INVALID_LOCAL_PORT' }); } }));
  assert.equal(result.turns.length, 1); assert.equal(result.failureStage, 'bootstrap-preferences');
  assert.equal(result.code, 'INVALID_LOCAL_PORT');
  assert.ok(result.turns[0].trace.every(event => !('text' in event)));
});
