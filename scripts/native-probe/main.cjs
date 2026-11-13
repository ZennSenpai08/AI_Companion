const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const destination = path.resolve(process.env.MIKA_PROBE_ARTIFACT_DIR || '');
if (!destination.startsWith(path.join(root, 'test-artifacts/electron-startup') + path.sep)) {
  throw new Error('Probe output must be inside the project investigation folder.');
}
/** @param {string} event @param {object} [detail] */
function record(event, detail = {}) {
  const entry = { event, at: new Date().toISOString(), pid: process.pid, ...detail };
  fs.appendFileSync(path.join(destination, 'stages.jsonl'), JSON.stringify(entry) + '\n');
  console.log(JSON.stringify(entry));
}
record('main-entered', { versions: process.versions,
  softwareRendering: process.env.MIKA_PROBE_SOFTWARE_RENDERING === '1' });
const { app, BrowserWindow, session } = require('electron');
app.enableSandbox();
// Explicit diagnostic only; hardware acceleration is independent of sandbox protection.
if (process.env.MIKA_PROBE_SOFTWARE_RENDERING === '1') app.disableHardwareAcceleration();
app.on('child-process-gone', (_event, detail) => record('child-process-gone', detail));
app.on('will-quit', () => record('will-quit'));
app.on('quit', (_event, exitCode) => record('quit', { exitCode }));
// Native visible-window test only: no app backend, framework, network or external content.
app.whenReady().then(async () => {
  record('app-ready');
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    callback({ cancel: details.url !== require('node:url').pathToFileURL(path.join(__dirname, 'probe.html')).href });
  });
  const win = new BrowserWindow({ width: 520, height: 300, show: false,
    title: 'Mika native sandbox startup test', backgroundColor: '#ffffff',
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'), webviewTag: false, spellcheck: false } });
  record('window-created', { nativeHandleBytes: win.getNativeWindowHandle().length });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('render-process-gone', (_event, detail) => record('render-process-gone', detail));
  await win.loadFile(path.join(__dirname, 'probe.html'));
  const renderer = await win.webContents.executeJavaScript(
    "({nodeExposed:typeof require!=='undefined',title:document.title,text:document.body.innerText,security:window.nativeProbeSecurity})");
  if (renderer.nodeExposed || !renderer.security?.sandboxed || !renderer.security?.contextIsolated) {
    throw new Error('Renderer security checks failed.');
  }
  record('renderer-ready', { renderer, rendererPid: win.webContents.getOSProcessId() });
  win.show();
  record('window-visible', { visible: win.isVisible(), bounds: win.getBounds(),
    metrics: app.getAppMetrics().map(metric => ({ pid: metric.pid, type: metric.type,
      ...(metric.type === 'Tab' ? { sandboxed: metric.sandboxed } : {}) })) });
  await new Promise(resolve => setTimeout(resolve, 2000));
  const screenshot = await win.webContents.capturePage();
  fs.writeFileSync(path.join(destination, 'native-window.png'), screenshot.toPNG());
  record('content-captured', { size: screenshot.getSize(), empty: screenshot.isEmpty() });
  win.close();
  record('window-closed', { destroyed: win.isDestroyed() });
  app.quit();
}).catch(error => { record('probe-error', { message: String(error) }); app.exit(1); });
