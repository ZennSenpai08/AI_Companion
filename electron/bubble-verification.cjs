// Native smoke only. Synthetic layout text is never real inference acceptance.
const fs = require('node:fs');
const path = require('node:path');

/** @param {number[]} color */
function luminance(color) {
  return color.slice(0, 3).map(channel => {
    const value = channel / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  }).reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
}
/** Conservative contrast against both black and white desktops.
 * @param {number[]} foreground @param {number[]} background */
function contrast(foreground, background) {
  if (![foreground, background].every(color => Array.isArray(color) && color.length === 4 &&
      color.every(Number.isFinite) && color.slice(0, 3).every(v => v >= 0 && v <= 255) && color[3] >= 0 && color[3] <= 1)) return 0;
  return Math.min(...[0, 255].map(desktop => {
    const back = background.slice(0, 3).map(value => value * background[3] + desktop * (1 - background[3]));
    const front = foreground.slice(0, 3).map((value, index) => value * foreground[3] + back[index] * (1 - foreground[3]));
    const values = [luminance(front), luminance(back)];
    return (Math.max(...values) + .05) / (Math.min(...values) + .05);
  }));
}
/** @typedef {{x:number,y:number,width:number,height:number,bottom:number,right:number}} Rect */
/** @typedef {{width:number,height:number,frame:Rect,avatar:Rect,bubble:Rect,controls:Rect,
 * text:string,phase:string,clientWidth:number,scrollWidth:number,clientHeight:number,scrollHeight:number,
 * overflowY:string,foreground:number[],heading:number[],background:number[],transparent:boolean,
 * noChatbox:boolean,microphoneOff:boolean}} Layout */
/** @param {Layout} sample */
function assessLayout(sample) {
  /** @param {Rect} rect */
  const inside = rect => !!rect && [rect.x, rect.y, rect.width, rect.height, rect.bottom, rect.right].every(Number.isFinite) &&
    rect.width > 0 && rect.height > 0 && rect.x >= -1 && rect.y >= -1 && rect.right <= sample.width + 1 && rect.bottom <= sample.height + 1;
  const checks = {
    insideViewport: [sample.frame, sample.avatar, sample.bubble, sample.controls].every(inside),
    belowAvatar: sample.bubble?.y >= sample.avatar?.bottom,
    noHorizontalOverflow: sample.clientWidth > 0 && sample.scrollWidth <= sample.clientWidth + 1,
    longTextScrollable: sample.clientHeight > 0 && sample.scrollHeight > sample.clientHeight && ['auto', 'scroll'].includes(sample.overflowY),
    contrast: contrast(sample.foreground, sample.background) >= 4.5 && contrast(sample.heading, sample.background) >= 4.5,
    transparentHost: sample.transparent === true,
    optionalPanelOnly: sample.noChatbox === true,
    microphoneOff: sample.microphoneOff === true,
  };
  return { checks, passed: Object.values(checks).every(Boolean) };
}

/** @param {import('electron').BrowserWindow} win
 * @param {ReturnType<typeof import('./presentation.cjs').createPresentation>} presentation
 * @param {string} directory */
async function verifyBubble(win, presentation, directory) {
  const original = win.getBounds();
  /** @type {Array<Record<string, unknown>>} */
  const sizes = [];
  // Bounded readiness: observe actual Vue DOM, never extend model inference deadlines.
  /** @param {string} text @param {string} phase @returns {Promise<Layout>} */
  const sample = (text, phase) => win.webContents.executeJavaScript(`(async () => {
    const end = performance.now() + 2000;
    while (document.querySelector('.bubble-text')?.textContent !== ${JSON.stringify(text)} ||
           document.querySelector('.speech-bubble')?.dataset.responsePhase !== ${JSON.stringify(phase)}) {
      if (performance.now() >= end) throw new Error('Bubble DOM readiness deadline');
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    await new Promise(resolve => setTimeout(resolve, 250));
    const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect();
      return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}; };
    const rgba = value => { const numbers = value.match(/[\\d.]+/g)?.map(Number) ?? []; return [...numbers.slice(0,3),numbers[3] ?? 1]; };
    const text = document.querySelector('.bubble-text'); const style = getComputedStyle(text);
    return {width:innerWidth,height:innerHeight,frame:rect('.companion-frame'),avatar:rect('.avatar-slot'),
      bubble:rect('.speech-bubble'),controls:rect('.companion-controls'),text:text.textContent,
      phase:document.querySelector('.speech-bubble').dataset.responsePhase,
      clientWidth:text.clientWidth,scrollWidth:text.scrollWidth,clientHeight:text.clientHeight,scrollHeight:text.scrollHeight,
      overflowY:style.overflowY,foreground:rgba(style.color),heading:rgba(getComputedStyle(document.querySelector('.bubble-heading')).color),
      background:rgba(getComputedStyle(document.querySelector('.speech-bubble')).backgroundColor),
      transparent:[document.documentElement,document.body,document.querySelector('.companion-frame')].every(node => {
        const s=getComputedStyle(node); return rgba(s.backgroundColor)[3]===0 && s.backgroundImage==='none'; }),
      noChatbox:!document.querySelector('textarea,.conversation'),microphoneOff:document.querySelector('.mic-off')?.textContent==='MIC OFF'};
  })()`);
  try {
    fs.mkdirSync(directory, { recursive: true });
    for (const [index, dimensions] of [[360, 560], [240, 300]].entries()) {
      win.setBounds({ ...original, width: dimensions[0], height: dimensions[1] });
      const sequence = 900000 + index;
      presentation.start(sequence);
      const thinking = await sample('One moment…', 'thinking');
      const first = 'LAYOUT TEST ONLY — synthetic text, not an AI response.\n';
      presentation.consume(sequence, { type: 'delta', text: first });
      const partial = await sample(first, 'generating');
      const extra = ('Wrapping check: a_very_long_unbroken_token_' + 'x'.repeat(160) + '\n').repeat(8);
      presentation.consume(sequence, { type: 'delta', text: extra });
      presentation.consume(sequence, { type: 'done' });
      const complete = await sample(first + extra, 'complete');
      const before = win.getBounds();
      win.setPosition(before.x + 8, before.y + 8, false);
      const moved = await sample(first + extra, 'complete');
      const after = win.getBounds();
      const movingTogether = after.x - before.x === 8 && after.y - before.y === 8 &&
        Math.abs(moved.bubble.x - complete.bubble.x) <= 1 && Math.abs(moved.bubble.y - complete.bubble.y) <= 1;
      const assessment = assessLayout(complete);
      const streamUpdates = thinking.phase === 'thinking' && partial.text === first && complete.text === first + extra;
      sizes.push({ size: dimensions, scope: 'Synthetic native layout fixture; no model or audio',
        ...assessment, streamUpdates, movingTogether, sample: complete,
        passed: assessment.passed && streamUpdates && movingTogether });
      fs.writeFileSync(path.join(directory, `bubble-layout-${dimensions[0]}x${dimensions[1]}.png`),
        (await win.webContents.capturePage()).toPNG());
    }
    return { scope: 'Synthetic native layout fixture, not inference', sizes, passed: sizes.every(size => size.passed) };
  } catch {
    return { scope: 'Synthetic native layout fixture, not inference', sizes, passed: false, error: 'BUBBLE_LAYOUT_VERIFICATION_FAILED' };
  } finally {
    presentation.clear();
    if (!win.isDestroyed()) win.setBounds(original);
  }
}
module.exports = { verifyBubble, assessLayout, contrast };
