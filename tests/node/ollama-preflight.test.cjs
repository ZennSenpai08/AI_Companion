const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseListeners } = require('../../scripts/ollama-check.cjs');

// Listener-string fixtures validate admission, not real Ollama connectivity.
test('real-model preflight accepts only verified loopback listener bindings', () => {
  assert.equal(parseListeners('  TCP 127.0.0.1:11434 0.0.0.0:0 LISTENING 123\n').loopbackOnly, true);
  assert.equal(parseListeners('  TCP [::1]:11434 [::]:0 LISTENING 123\n').loopbackOnly, true);
  assert.equal(parseListeners('  TCP 0.0.0.0:11434 0.0.0.0:0 LISTENING 123\n').loopbackOnly, false);
  assert.equal(parseListeners('  TCP [::]:11434 [::]:0 LISTENING 123\n').loopbackOnly, false);
  assert.equal(parseListeners('  TCP 192.168.1.2:11434 0.0.0.0:0 LISTENING 123\n').loopbackOnly, false);
});
test('connections, unrelated ports, empty or unknown listener output cannot pass', () => {
  for (const output of ['', '  TCP 127.0.0.1:11434 127.0.0.1:123 ESTABLISHED 123',
    '  TCP 127.0.0.1:123 0.0.0.0:0 LISTENING 123', 'unavailable'])
    assert.equal(parseListeners(output).loopbackOnly, false);
});
