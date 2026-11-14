const http = require('node:http');
const { TextDecoder } = require('node:util');
const MODELS = Object.keys(require('../backend/llm/model_policy.json').models);
const STATES = ['IDLE', 'LISTENING', 'TRANSCRIBING', 'THINKING', 'SPEAKING', 'INTERRUPTED', 'ERROR'];
/** @param {unknown} input */
function validateChat(input) {
  if (!input || typeof input !== 'object') throw new Error('Invalid message');
  const text = Reflect.get(input, 'text');
  const model = Reflect.get(input, 'model');
  const language = Reflect.get(input, 'language');
  if (typeof text !== 'string' || !text.trim() || text.length > 4000 ||
      !MODELS.includes(model) || !['auto', 'en', 'fil', 'taglish'].includes(language)) {
    throw new Error('Select a local model/language and enter 1–4000 characters.');
  }
  return { text, model, language };
}
/** @param {unknown} value @returns {Record<string, unknown>} */
function validateEvent(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid conversation event');
  const type = Reflect.get(value, 'type');
  const event = /** @type {Record<string, unknown>} */ (value);
  if (type === 'delta' && typeof event.text === 'string' && event.text.length <= 16000) return event;
  if (type === 'state' && typeof event.state === 'string' && STATES.includes(event.state)) return event;
  if (type === 'done') return event;
  if (type === 'error' && typeof event.message === 'string' && event.message.length <= 500) return event;
  throw new Error('Invalid conversation event');
}
/** @param {number} port @param {string} token @param {object} body
 * @param {AbortSignal} signal @param {(event:Record<string,unknown>)=>void} onEvent
 * @param {{timeoutMs?:number}} [options] */
function streamChat(port, token, body, signal, onEvent, options = {}) {
  return new Promise((resolve, reject) => {
    if (!Number.isInteger(port) || port < 1 || port > 65535 || !/^[0-9a-f]{64}$/.test(token)) {
      reject(new Error('Backend unavailable')); return;
    }
    const timeoutMs = options.timeoutMs ?? 95000;
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) { reject(new Error('Invalid timeout')); return; }
    let settled = false;
    /** @param {Error | null} error */
    const finish = error => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      if (error) reject(error); else resolve(undefined);
    };
    const request = http.request({ hostname: '127.0.0.1', port, path: '/chat', method: 'POST',
      signal, agent: false, timeout: timeoutMs,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }, response => {
      if (response.statusCode !== 200) {
        response.destroy(); finish(new Error('Local chat rejected request')); return;
      }
      let buffer = Buffer.alloc(0);
      let total = 0;
      let terminal = '';
      const decoder = new TextDecoder('utf-8', { fatal: true });
      response.on('data', chunk => {
        if (settled || signal.aborted || request.destroyed) return;
        total += chunk.length;
        if (total > 4 * 1024 * 1024) { fail(new Error('Conversation transfer limit exceeded')); return; }
        buffer = Buffer.concat([buffer, chunk]);
        let index;
        while ((index = buffer.indexOf(10)) >= 0) {
          if (settled || signal.aborted || request.destroyed) return;
          if (index > 65536) { fail(new Error('Conversation packet too large')); return; }
          const line = buffer.subarray(0, index); buffer = buffer.subarray(index + 1);
          if (!line.length) continue;
          try {
            const event = validateEvent(JSON.parse(decoder.decode(line)));
            if (terminal && !(event.type === 'state' &&
                event.state === (terminal === 'done' ? 'IDLE' : 'ERROR'))) throw new Error('Event after completion');
            if (event.type === 'done' || event.type === 'error') terminal = event.type;
            onEvent(event);
          } catch { fail(new Error('Invalid conversation event')); return; }
        }
        if (buffer.length > 65536) fail(new Error('Conversation packet too large'));
      });
      response.on('error', error => finish(error));
      response.on('end', () => {
        if (buffer.length || !terminal) finish(new Error('Conversation stream incomplete'));
        else finish(null);
      });
    });
    /** @param {Error} error */
    const fail = error => { finish(error); request.destroy(error); };
    const timer = setTimeout(() => fail(new Error('Local chat timed out')), timeoutMs);
    request.on('timeout', () => fail(new Error('Local chat timed out')));
    request.on('error', error => finish(error));
    request.end(JSON.stringify(body));
  });
}
module.exports = { validateChat, validateEvent, streamChat };
