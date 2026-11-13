const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { requestLocal, MAX_RESPONSE_BYTES } = require('../../electron/http.cjs');

async function withResponse(body, action) {
  const server = http.createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(body);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await action(server.address().port); }
  finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}

test('valid bounded Unicode memory export passes the IPC HTTP response limit', async () => {
  const memories = Array.from({ length: 2000 }, (_, index) => ({ id: String(index),
    text: '🌸'.repeat(500), provenance: 'memory-controls', confidence: 'user-approved' }));
  const serialized = JSON.stringify({ version: 1, memories });
  assert.ok(Buffer.byteLength(serialized) > 2 * 1024 * 1024);
  assert.ok(Buffer.byteLength(serialized) < MAX_RESPONSE_BYTES);
  await withResponse(serialized, async port => {
    const result = await requestLocal(port, 'a'.repeat(64), '/memory-export');
    assert.equal(result.memories.length, 2000);
    assert.equal(result.memories[1999].text, memories[1999].text);
  });
});

test('memory export still rejects data exceeding its bounded byte budget', async () => {
  await withResponse(JSON.stringify({ unexpected: 'x'.repeat(MAX_RESPONSE_BYTES) }), async port => {
    await assert.rejects(requestLocal(port, 'a'.repeat(64), '/memory-export'), /too large/);
  });
});
