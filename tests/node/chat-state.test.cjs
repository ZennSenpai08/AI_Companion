const { test } = require('node:test');
const assert = require('node:assert/strict');
const source = import('../../frontend/src/services/chat-state.mjs');

test('rejected admission removes both optimistic messages and preserves history', async () => {
  const api = await source;
  const state = api.createChatState([{ role: 'assistant', content: 'Earlier reply' }]);
  api.beginTurn(state, 'New message');
  api.rejectStart(state, 'Low available RAM');
  assert.deepEqual(state.messages, [{ role: 'assistant', content: 'Earlier reply', status: 'complete' }]);
  assert.equal(state.busy, false); assert.equal(state.error, 'Low available RAM');
});
test('notifications before admission response replay only the accepted sequence', async () => {
  const api = await source; const state = api.createChatState();
  api.beginTurn(state, 'Hello');
  api.consumeEvent(state, { type: 'delta', text: 'stale', sequence: 4 });
  api.consumeEvent(state, { type: 'state', state: 'THINKING', sequence: 5 });
  api.consumeEvent(state, { type: 'delta', text: 'Kumusta!', sequence: 5 });
  api.bindSequence(state, 5);
  assert.equal(state.messages[1].content, 'Kumusta!');
  api.consumeEvent(state, { type: 'done', sequence: 5 });
  assert.equal(state.busy, false); assert.equal(state.state, 'IDLE');
});
test('stop and newer turns reject stale content and error notifications', async () => {
  const api = await source; const state = api.createChatState();
  api.beginTurn(state, 'First'); api.bindSequence(state, 8);
  api.consumeEvent(state, { type: 'delta', text: 'partial', sequence: 8 });
  api.interruptTurn(state);
  api.consumeEvent(state, { type: 'delta', text: 'discard', sequence: 8 });
  assert.equal(state.messages[1].content, 'partial'); assert.equal(state.messages[1].status, 'interrupted');
  api.beginTurn(state, 'Second');
  api.consumeEvent(state, { type: 'delta', text: 'old', sequence: 8 }); api.bindSequence(state, 10);
  api.consumeEvent(state, { type: 'error', message: 'old error', sequence: 8 });
  api.consumeEvent(state, { type: 'delta', text: 'new reply', sequence: 10 });
  api.consumeEvent(state, { type: 'done', sequence: 10 });
  assert.equal(state.messages[3].content, 'new reply'); assert.equal(state.error, '');
});
test('stop before admission cannot bind or roll back a newer request', async () => {
  const api = await source; const state = api.createChatState();
  const oldEpoch = api.beginTurn(state, 'First'); api.interruptTurn(state);
  const newEpoch = api.beginTurn(state, 'Second');
  assert.equal(api.bindSequence(state, 1, oldEpoch), false);
  api.rejectStart(state, 'Old error', oldEpoch);
  assert.equal(state.busy, true); assert.equal(state.messages.length, 4);
  assert.equal(api.bindSequence(state, 3, newEpoch), true);
});
test('history reset invalidates outstanding admission responses', async () => {
  const api = await source; const state = api.createChatState();
  const epoch = api.beginTurn(state, 'Before reset'); api.interruptTurn(state); api.resetChat(state);
  api.beginTurn(state, 'After reset');
  assert.equal(api.bindSequence(state, 1, epoch), false);
});
test('errors and reply limits leave a recoverable terminal state', async () => {
  const api = await source; const state = api.createChatState();
  api.beginTurn(state, 'Hello'); api.bindSequence(state, 2);
  api.consumeEvent(state, { type: 'error', message: 'Model missing', sequence: 2 });
  assert.equal(state.busy, false); assert.equal(state.messages[0].status, 'failed');
  api.beginTurn(state, 'Retry'); api.bindSequence(state, 3);
  api.consumeEvent(state, { type: 'delta', text: 'x'.repeat(16001), sequence: 3 });
  assert.equal(state.state, 'ERROR'); assert.equal(state.messages[3].content, '');
});
