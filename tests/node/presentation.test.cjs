const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createPresentation } = require('../../electron/presentation.cjs');
const { ignoreOverlayMouse } = require('../../electron/overlay-input.cjs');
const ui = import('../../frontend/src/services/presentation.mjs');

test('progressive text is identical to the stream and is never represented as spoken audio', () => {
  const updates = []; let now = 100;
  const presenter = createPresentation(value => updates.push(value), () => now++);
  presenter.start(1);
  presenter.consume(1, { type: 'state', state: 'THINKING' });
  presenter.consume(1, { type: 'delta', text: 'Uy, ' });
  presenter.consume(1, { type: 'delta', text: 'Mika!\nKamusta?' });
  presenter.consume(1, { type: 'done' });
  presenter.consume(1, { type: 'state', state: 'IDLE' });
  assert.equal(presenter.snapshot().text, 'Uy, Mika!\nKamusta?');
  assert.equal(presenter.snapshot().phase, 'complete');
  assert.ok(updates.every(value => value.source === 'text' && value.audioActive === false));
  assert.deepEqual(updates.map(value => value.phase), ['thinking', 'generating', 'generating', 'complete']);
  const copy = presenter.snapshot(); copy.text = 'tampered';
  assert.notEqual(presenter.snapshot().text, copy.text);
});

test('cancelled/replaced streams cannot overwrite the latest bubble; clear removes cached text', () => {
  const presenter = createPresentation(() => {});
  presenter.start(1); presenter.consume(1, { type: 'delta', text: 'partial' });
  presenter.interrupt();
  presenter.consume(1, { type: 'delta', text: 'discard' });
  assert.equal(presenter.snapshot().text, 'partial');
  assert.equal(presenter.snapshot().phase, 'interrupted');
  presenter.start(2);
  presenter.consume(1, { type: 'done' });
  presenter.consume(1, { type: 'error', message: 'old failure' });
  assert.equal(presenter.snapshot().phase, 'thinking');
  presenter.reject('Cannot replace an active response');
  assert.equal(presenter.snapshot().phase, 'thinking');
  presenter.consume(2, { type: 'error', message: 'Ollama is unavailable' });
  assert.equal(presenter.snapshot().phase, 'error');
  presenter.clear();
  assert.equal(presenter.snapshot().text, ''); assert.equal(presenter.snapshot().phase, 'idle');
});

test('reload/expiry timing is based on completion, not last delta; errors and hold=0 stay visible', async () => {
  const { bubbleVisible, bubbleDeadline, presentationActive } = await ui;
  const presenter = createPresentation(() => {}, () => 100);
  presenter.start(1);
  assert.equal(presentationActive(presenter.snapshot()), true);
  assert.equal(bubbleDeadline(presenter.snapshot(), 12000), null);
  presenter.consume(1, { type: 'done' });
  const value = presenter.snapshot();
  assert.equal(bubbleVisible(value, 12099, 12000, -1), true);
  assert.equal(bubbleVisible(value, 12100, 12000, -1), false);
  assert.equal(bubbleVisible(value, 999999, 0, -1), true);
  assert.equal(bubbleVisible(value, 100, 0, value.revision), false);
  presenter.reject('Local request rejected');
  assert.equal(bubbleVisible(presenter.snapshot(), 999999, 3000, -1), true);
});

test('explicit click through always wins and empty overlay space does not capture mouse input', () => {
  assert.equal(ignoreOverlayMouse(false, false), true);
  assert.equal(ignoreOverlayMouse(false, true), false);
  assert.equal(ignoreOverlayMouse(true, true), true);
  assert.equal(ignoreOverlayMouse(true, false), true);
});
