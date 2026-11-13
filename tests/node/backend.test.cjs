const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync, spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');
const { BackendSupervisor } = require('../../electron/supervisor.cjs');
const { requestLocal } = require('../../electron/http.cjs');
const root = path.resolve(__dirname, '../..');
const python = process.env.MIKA_PYTHON || path.join(root, '.venv/Scripts/python.exe');
const availability = spawnSync(python, ['-c', 'import fastapi,uvicorn,httpx,pydantic'],
  { cwd: root, windowsHide: true, encoding: 'utf8' });
const skip = availability.status === 0 ? false : 'Supported FastAPI runtime not installed for selected Python';
function temporaryData() {
  const parent = path.join(root, 'test-artifacts/backend-runtime');
  fs.mkdirSync(parent, { recursive: true });
  return fs.mkdtempSync(path.join(parent, 'run-'));
}

test('production bootstrap starts real authenticated FastAPI, persists memory, restarts and shuts down',
  { skip, timeout: 25000 }, async () => {
    const dataDir = temporaryData();
    const backend = new BackendSupervisor({ command: python, args: ['-m', 'backend.bootstrap'],
      cwd: root, dataDir, timeoutMs: 15000 });
    try {
      await backend.start(); const pid = backend.child.pid; const port = backend.port;
      const health = await backend.request('/health');
      assert.equal(health.status, 'ok'); assert.equal(health.microphone, 'off');
      await assert.rejects(requestLocal(port, 'b'.repeat(64), '/health'));
      const result = await requestLocal(port, backend.token, '/memory', {
        operation: 'remember', text: 'Fixture user prefers Taglish', approved: true,
      });
      assert.equal(typeof result.id, 'string');
      await requestLocal(port, backend.token, '/preferences', { language: 'taglish', volume: 0.4 });
      await backend.stop(); assert.throws(() => process.kill(pid, 0));
      await assert.rejects(requestLocal(port, 'a'.repeat(64), '/health'));
      await backend.start();
      const preferences = await backend.request('/preferences');
      assert.equal(preferences.language, 'taglish'); assert.equal(preferences.volume, 0.4);
      const memories = await backend.request('/memories');
      assert.equal(memories.memories.length, 1);
      assert.equal(memories.memories[0].id, result.id);
      await requestLocal(backend.port, backend.token, '/memory', {
        operation: 'forget', id: result.id, approved: true,
      });
      assert.deepEqual((await backend.request('/memories')).memories, []);
    } finally { await backend.stop(); }
  });

test('real bootstrap exits and releases its socket when its parent input pipe closes',
  { skip, timeout: 20000 }, async () => {
    const child = spawn(python, ['-m', 'backend.bootstrap'], {
      cwd: root, windowsHide: true, shell: false,
    });
    let port;
    const pid = child.pid;
    try {
      child.stderr.resume();
      const ready = new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Real bootstrap readiness timed out')), 15000);
        let output = '';
        child.stdout.on('data', chunk => {
          output += chunk;
          if (!output.includes('\n')) return;
          clearTimeout(timer);
          const event = JSON.parse(output.split('\n')[0]);
          if (event.type !== 'ready') reject(new Error('Real bootstrap did not become ready'));
          else resolve(event.port);
        });
        child.once('error', reject);
      });
      child.stdin.write(JSON.stringify({ token: 'a'.repeat(64), dataDir: temporaryData() })+'\n');
      port = await ready;
      assert.equal((await requestLocal(port, 'a'.repeat(64), '/health')).service, 'mika-assistant');
      const exited = once(child, 'exit'); child.stdin.end();
      await exited;
      assert.throws(() => process.kill(pid, 0));
      await assert.rejects(requestLocal(port, 'a'.repeat(64), '/health'));
    } finally { child.kill(); }
  });
