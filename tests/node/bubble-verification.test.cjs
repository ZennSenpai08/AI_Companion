const { test } = require('node:test');
const assert = require('node:assert/strict');
const { assessLayout, contrast, verifyBubble } = require('../../electron/bubble-verification.cjs');
const { createPresentation } = require('../../electron/presentation.cjs');
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');

function evidence() {
  const rect = (x, y, width, height) => ({ x, y, width, height, right:x + width, bottom:y + height });
  return { width:240, height:300, frame:rect(0,0,240,300), avatar:rect(40,40,150,80),
    bubble:rect(12,130,216,100), controls:rect(15,250,210,30),
    clientWidth:190, scrollWidth:190, clientHeight:60, scrollHeight:800, overflowY:'auto',
    foreground:[245,241,255,1], heading:[209,187,238,1], background:[23,21,36,.98],
    transparent:true, noChatbox:true, microphoneOff:true };
}
// Geometry fixtures validate rejection rules; they do not prove real CSS/native rendering.
test('bubble acceptance rejects overlap, clipping, horizontal overflow and unreadable text', () => {
  assert.equal(assessLayout(evidence()).passed, true);
  const overlap = evidence(); overlap.bubble.y = 100;
  assert.equal(assessLayout(overlap).checks.belowAvatar, false);
  const clipped = evidence(); clipped.controls.bottom = 320;
  assert.equal(assessLayout(clipped).checks.insideViewport, false);
  const overflow = evidence(); overflow.scrollWidth = 500;
  assert.equal(assessLayout(overflow).checks.noHorizontalOverflow, false);
  const unreadable = evidence(); unreadable.foreground = unreadable.background;
  assert.equal(assessLayout(unreadable).checks.contrast, false);
});
test('transparent or invalid backgrounds cannot receive an optimistic contrast pass', () => {
  assert.equal(contrast([255,255,255,1], [0,0,0,0]), 1);
  assert.equal(contrast([], [0,0,0,1]), 0);
  assert.equal(contrast([255,255,255,1], [0,0,0,1]), 21);
  const opaqueHost = evidence(); opaqueHost.transparent = false;
  assert.equal(assessLayout(opaqueHost).passed, false);
});
test('renderer failure clears synthetic text and restores the original native window bounds', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mika-bubble-test-'));
  const original = { x:10,y:20,width:300,height:500 }; const bounds = [];
  const presentation = createPresentation(() => {});
  const win = { getBounds:() => original, setBounds:value => bounds.push(value), isDestroyed:() => false,
    webContents:{ executeJavaScript:async () => { throw new Error('fixture renderer unavailable'); } } };
  try {
    const result = await verifyBubble(win, presentation, directory);
    assert.equal(result.passed, false);
    assert.equal(result.error, 'BUBBLE_LAYOUT_VERIFICATION_FAILED');
    assert.deepEqual(bounds.at(-1), original);
    assert.equal(presentation.snapshot().phase, 'idle');
    assert.equal(presentation.snapshot().text, '');
  } finally { fs.rmdirSync(directory); }
});
