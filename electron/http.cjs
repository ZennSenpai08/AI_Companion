const http = require('node:http');
// The bounded SQLite store permits 2000 facts of 500 Unicode characters plus metadata.
// JSON export and 50-message history can legitimately exceed 2 MiB in UTF-8.
const MAX_RESPONSE_BYTES = 8 * 1024 * 1024;
/** @param {number} port @param {string} token @param {string} route @param {object | null} [body] */
function requestLocal(port, token, route, body = null) {
  if (!Number.isInteger(port) || port < 1 || port > 65535 ||
      !/^[0-9a-f]{64}$/.test(token) || !['/health', '/diagnostics', '/messages', '/memories', '/memory-export', '/memory', '/history-clear', '/preferences', '/models'].includes(route)) {
    return Promise.reject(new Error('Invalid local request'));
  }
  return new Promise((resolve, reject) => {
    const request = http.request({ method: body ? 'POST' : 'GET', hostname: '127.0.0.1', port, path: route,
      agent: false, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 2500 }, response => {
      let data = '';
      let receivedBytes = 0;
      response.setEncoding('utf8');
      response.on('data', chunk => {
        receivedBytes += Buffer.byteLength(chunk, 'utf8');
        data += chunk;
        if (receivedBytes > MAX_RESPONSE_BYTES) request.destroy(new Error('Response too large'));
      });
      response.on('error', reject);
      response.on('end', () => {
        if (response.statusCode !== 200) return reject(new Error('Local service rejected request'));
        try { resolve(JSON.parse(data)); } catch { reject(new Error('Invalid local response')); }
      });
    });
    request.on('timeout', () => request.destroy(new Error('Local service timed out')));
    request.on('error', reject);
    request.end(body ? JSON.stringify(body) : undefined);
  });
}
module.exports = { requestLocal, MAX_RESPONSE_BYTES };
