const http = require('node:http');
const MODELS = ['qwen3.5:0.8b', 'qwen3.5:4b', 'qwen3.5:9b'];
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
/** @param {number} port @param {string} token @param {object} body
 * @param {AbortSignal} signal @param {(event:Record<string,unknown>)=>void} onEvent */
function streamChat(port, token, body, signal, onEvent) {
  return new Promise((resolve, reject) => {
    if (!Number.isInteger(port) || port < 1 || port > 65535 || !/^[0-9a-f]{64}$/.test(token)) {
      reject(new Error('Backend unavailable')); return;
    }
    const request = http.request({ hostname: '127.0.0.1', port, path: '/chat', method: 'POST',
      signal, agent: false, timeout: 95000,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }, response => {
      if (response.statusCode !== 200) { response.resume(); reject(new Error('Local chat rejected request')); return; }
      let buffer = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        buffer += chunk;
        if (buffer.length > 65536) { request.destroy(new Error('Invalid conversation stream')); return; }
        let index;
        while ((index = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, index); buffer = buffer.slice(index + 1);
          try {
            const event = JSON.parse(line);
            if (!['state', 'delta', 'done', 'error'].includes(event.type)) throw new Error('Invalid event');
            onEvent(event);
          } catch { request.destroy(new Error('Invalid conversation event')); return; }
        }
      });
      response.on('error', reject);
      response.on('end', () => {
        if (buffer.trim()) reject(new Error('Conversation stream incomplete')); else resolve(undefined);
      });
    });
    request.on('timeout', () => request.destroy(new Error('Local chat timed out')));
    request.on('error', reject);
    request.end(JSON.stringify(body));
  });
}
module.exports = { validateChat, streamChat };
