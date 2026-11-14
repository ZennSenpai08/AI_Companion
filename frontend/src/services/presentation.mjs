/** @typedef {import('../types/bridge.d.ts').ResponsePresentation} Presentation */
/** @returns {Presentation} */
export function emptyPresentation() {
  return { revision: 0, sequence: 0, source: 'text', audioActive: false, phase: 'idle',
    text: '', updatedAt: 0, endedAt: null };
}
/** @param {Presentation} value */
export function presentationActive(value) {
  return ['thinking', 'generating', 'listening', 'transcribing', 'speaking'].includes(value.phase);
}
/** Errors stay readable until dismissed. 0 = keep the completed caption.
 * @param {Presentation} value @param {number} holdMs @returns {number|null} */
export function bubbleDeadline(value, holdMs) {
  return ['complete', 'interrupted'].includes(value.phase) && value.endedAt !== null && holdMs > 0
    ? value.endedAt + holdMs : null;
}
/** @param {Presentation} value @param {number} now @param {number} holdMs @param {number} dismissed */
export function bubbleVisible(value, now, holdMs, dismissed) {
  if (value.phase === 'idle' || value.revision === dismissed) return false;
  const deadline = bubbleDeadline(value, holdMs);
  return deadline === null || now < deadline;
}
