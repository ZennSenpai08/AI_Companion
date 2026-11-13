const { app, BrowserWindow } = require('electron');
// No app backend, preload, third-party renderer or network access. All security defaults
// match the product. A successful probe alone would not validate application behavior.
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 320, height: 240, show: false,
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false } });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  await win.loadFile(require('node:path').join(__dirname, 'probe.html'));
  const renderer = await win.webContents.executeJavaScript(
    "({nodeExposed:typeof require!=='undefined',title:document.title})");
  console.log(JSON.stringify({ probe: 'native-window', electron: process.versions.electron, renderer }));
  win.destroy(); app.quit();
}).catch(() => { console.error('Native probe failed after app readiness.'); app.exit(1); });
