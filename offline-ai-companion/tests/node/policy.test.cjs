const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { trustedDocument, allowedResource } = require('../../electron/policy.cjs');
const { recoverBounds } = require('../../electron/bounds.cjs');
const folder = path.resolve('electron/recovery');
const file = path.join(folder, 'index.html');
test('only exact known documents and main dev origin are trusted', () => {
  assert.equal(trustedDocument(pathToFileURL(file).href + '#panel', [file]), true);
  for (const url of ['https://evil.test', 'file:///C:/Windows/win.ini',
    'http://127.0.0.1:5173.evil.test/', 'http://localhost:5173/', 'http://127.0.0.1:5173/other']) {
    assert.equal(trustedDocument(url, [file], true), false, url);
  }
  assert.equal(trustedDocument('http://127.0.0.1:5173/', [file], true), true);
  assert.equal(trustedDocument('http://127.0.0.1:5173/', [file]), false);
});
test('renderer network policy rejects remote traffic and files outside shipped roots', () => {
  assert.equal(allowedResource(pathToFileURL(file).href, false, [folder]), true);
  for (const url of ['https://api.example.com', 'http://127.0.0.1:11434/api/chat',
    'file:///C:/Windows/win.ini', pathToFileURL(path.join(folder, '../main.cjs')).href]) {
    assert.equal(allowedResource(url, false, [folder]), false, url);
  }
  assert.equal(allowedResource('ws://127.0.0.1:5173/', true, [folder]), true);
});
test('saved coordinates recover after monitor disconnect and corrupted values', () => {
  const main = { x: 0, y: 0, width: 1920, height: 1040 };
  const negative = { x: -1280, y: 0, width: 1280, height: 720 };
  assert.deepEqual(recoverBounds({ x: -900, y: 100, width: 320, height: 460 }, [main, negative]),
    { x: -900, y: 100, width: 320, height: 460 });
  const fixed = recoverBounds({ x: -900, y: 900, width: 99999, height: 99999 }, [main]);
  assert.equal(fixed.x, 0); assert.equal(fixed.y + fixed.height, main.height);
  assert.ok(fixed.width <= main.width);
  assert.deepEqual(recoverBounds({ x: NaN, y: Infinity, width: -20, height: 'bad' }, [main]),
    { x: 24, y: 24, width: 240, height: 460 });
});
