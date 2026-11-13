const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '../..');
const destination = path.resolve(process.env.MIKA_VISIBLE_PROBE_ARTIFACT_DIR || '');
if (!destination.startsWith(path.join(root, 'test-artifacts/electron-startup') + path.sep)) {
  throw new Error('Visible probe output must remain inside the project investigation folder.');
}
/** @param {string} event @param {object} [detail] */
function record(event, detail = {}) {
  const entry = { event, at: new Date().toISOString(), pid: process.pid, ...detail };
  fs.appendFileSync(path.join(destination, 'stages.jsonl'), JSON.stringify(entry) + '\n');
  console.log(JSON.stringify(entry));
}
record('main-entered', { versions: process.versions });
const { app, BrowserWindow, session } = require('electron');
app.enableSandbox();
app.on('quit', (_event, exitCode) => record('quit', { exitCode }));
app.on('window-all-closed', () => app.quit());
app.whenReady().then(async () => {
  record('app-ready', { electron: process.versions.electron });
  if (process.versions.electron !== process.env.MIKA_VISIBLE_PROBE_VERSION) {
    throw new Error('Runtime executable version differs from the installed Electron manifest.');
  }
  const allowed = new Set(['page.html', 'style.css'].map(name => pathToFileURL(path.join(__dirname, name)).href));
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  session.defaultSession.on('will-download', event => event.preventDefault());
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => callback({ cancel: !allowed.has(details.url) }));
  const win = new BrowserWindow({ width: 680, height: 420, minWidth: 480, minHeight: 320,
    title: 'Mika — Electron Native Test', show: false, backgroundColor: '#f4f6fb',
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), sandbox: true,
      contextIsolation: true, nodeIntegration: false, webviewTag: false, spellcheck: false } });
  win.setMenu(null);
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', event => event.preventDefault());
  win.webContents.on('will-attach-webview', event => event.preventDefault());
  win.webContents.on('render-process-gone', (_event, detail) => {
    record('renderer-failed', detail); app.exit(1);
  });
  win.on('closed', () => record('window-closed'));
  win.once('ready-to-show', () => {
    win.show(); win.focus();
    record('window-visible', { visible: win.isVisible(), bounds: win.getBounds() });
  });
  record('window-created', { nativeHandleBytes: win.getNativeWindowHandle().length,
    showPolicy: 'show on ready-to-show; close manually' });
  await win.loadFile(path.join(__dirname, 'page.html'));
  if (win.isDestroyed()) return;
  const renderer = await win.webContents.executeJavaScript(
    "({title:document.title,heading:document.querySelector('h1')?.textContent,nodeExposed:typeof require!=='undefined',security:window.visibleProbeSecurity})");
  if (renderer.nodeExposed || !renderer.security?.sandboxed || !renderer.security?.contextIsolated ||
      renderer.title !== 'Mika — Electron Native Test' || renderer.heading !== 'Electron is running successfully') {
    throw new Error('Visible test renderer/security checks failed.');
  }
  record('renderer-ready', { ...renderer, rendererPid: win.webContents.getOSProcessId() });
  try {
    const screenshot = await win.webContents.capturePage();
    fs.writeFileSync(path.join(destination, 'visible-window.png'), screenshot.toPNG());
    record('content-captured', { empty: screenshot.isEmpty(), size: screenshot.getSize() });
  } catch {
    if (!win.isDestroyed()) record('capture-unavailable');
  }
  // No timer, close(), destroy() or quit() here: the user owns the healthy window lifetime.
}).catch(error => { record('startup-failed', { message: String(error) }); app.exit(1); });
