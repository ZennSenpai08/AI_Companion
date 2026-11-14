/** Current response only: no history, persisted captions, audio claims or renderer commands.
 * Future audio engines must explicitly supply playback state; text never means speaking.
 * @typedef {import('../frontend/src/types/bridge.d.ts').ResponsePresentation} ResponsePresentation
 * @param {(value: ResponsePresentation) => void} emit
 * @param {()=>number} [now]
 */
function createPresentation(emit, now = Date.now) {
  /** @type {ResponsePresentation} */
  let value = { revision: 0, sequence: 0, phase: 'idle', text: '', audioActive: false,
    source: 'text', updatedAt: now(), endedAt: null };
  const snapshot = () => ({ ...value });
  /** @param {Partial<ResponsePresentation>} change */
  const update = change => {
    value = { ...value, ...change, revision: value.revision + 1, updatedAt: now() };
    emit(snapshot());
  };
  const active = () => ['thinking', 'generating'].includes(value.phase);
  return {
    snapshot,
    /** @param {number} sequence */
    start(sequence) { update({ sequence, phase: 'thinking', text: '', endedAt: null }); },
    /** @param {number} sequence @param {Record<string, unknown>} event */
    consume(sequence, event) {
      if (sequence !== value.sequence || !active()) return;
      if (event.type === 'delta' && typeof event.text === 'string') {
        if (value.text.length + event.text.length > 16000) {
          update({ phase: 'error', text: 'Reply exceeded the local text limit.', endedAt: now() });
        } else update({ phase: 'generating', text: value.text + event.text });
      } else if (event.type === 'done') update({ phase: 'complete', endedAt: now() });
      else if (event.type === 'error') update({ phase: 'error',
        text: typeof event.message === 'string' ? event.message.slice(0, 500) : 'Local conversation failed.', endedAt: now() });
    },
    interrupt() { if (active()) update({ phase: 'interrupted', endedAt: now() }); },
    /** @param {string} message */
    reject(message) { if (!active()) update({ phase: 'error', text: message.slice(0, 500), endedAt: now() }); },
    clear() { update({ sequence: 0, phase: 'idle', text: '', endedAt: null }); },
  };
}
module.exports = { createPresentation };
