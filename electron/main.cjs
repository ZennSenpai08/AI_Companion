const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, screen, session,
  globalShortcut, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { streamChat, validateChat } = require('./chat.cjs');
const { requestLocal } = require('./http.cjs');
const { BackendSupervisor } = require('./supervisor.cjs');
const { recoverBounds } = require('./bounds.cjs');
const { trustedDocument, allowedResource } = require('./policy.cjs');

const root = path.resolve(__dirname, '..');
const dev = !app.isPackaged && process.env.MIKA_DEV === '1';
if (!app.isPackaged && process.env.MIKA_DATA_DIR) app.setPath('userData', path.resolve(process.env.MIKA_DATA_DIR));
const dataDir = app.getPath('userData');
const files = [path.join(root, 'dist/index.html'), path.join(root, 'dist/overlay.html'),
  path.join(__dirname, 'recovery/index.html')];
/** @type {import('electron').BrowserWindow | null} */
let panel = null;
/** @type {import('electron').BrowserWindow | null} */
let overlay = null;
/** @type {import('electron').Tray | null} */
let tray = null;
let quitting = false;
let closing = false;
let topmost = true;
let clickThrough = false;
let shown = true;
/** @type {Record<string, unknown> | null} */
let lastHealth = null;
/** @type {NodeJS.Timeout | undefined} */
let writeTimer;
/** @type {AbortController | null} */
let activeChat = null;
let chatSequence = 0;
const backend = new BackendSupervisor({
  command: app.isPackaged ? path.join(process.resourcesPath, 'backend/mika-backend.exe')
    : process.env.MIKA_PYTHON || path.join(root, '.venv/Scripts/python.exe'),
  args: app.isPackaged ? [] : ['-m', 'backend.bootstrap'], cwd: root, dataDir,
});

function settingsPath() { return path.join(dataDir, 'desktop.json'); }
function readSettings() {
  try { return JSON.parse(fs.readFileSync(settingsPath(), 'utf8')); } catch { return {}; }
}
function persist() {
  if (!overlay || overlay.isDestroyed()) return;
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(settingsPath() + '.tmp', JSON.stringify({ bounds: overlay.getBounds(), topmost }));
    fs.renameSync(settingsPath() + '.tmp', settingsPath());
  } catch { /* Recoverable: defaults remain usable if settings cannot be written. */ }
}
function scheduleSave() { clearTimeout(writeTimer); writeTimer = setTimeout(persist, 250); }
function status() {
  return { backend: backend.snapshot(), health: lastHealth,
    desktop: { topmost, clickThrough, shown }, microphone: 'off',
    build: fs.existsSync(files[0]) ? 'vue' : 'recovery', phase: 'Foundation preview' };
}
/** @param {import('electron').BrowserWindow} win */
function secureWindow(win) {
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (!trustedDocument(url, files, dev)) event.preventDefault();
  });
  win.webContents.on('will-attach-webview', event => event.preventDefault());
  win.webContents.on('render-process-gone', () => { if (win === panel) panel = null; });
}
/** @param {import('electron').BrowserWindow} win @param {boolean} avatar */
async function loadWindow(win, avatar) {
  secureWindow(win);
  if (dev) await win.loadURL(`http://127.0.0.1:5173/${avatar ? 'overlay.html' : 'index.html'}`);
  else if (fs.existsSync(files[avatar ? 1 : 0])) await win.loadFile(files[avatar ? 1 : 0]);
  else await win.loadFile(files[2], { hash: avatar ? 'overlay' : 'panel' });
}
async function showPanel() {
  if (panel && !panel.isDestroyed()) { panel.show(); panel.focus(); return; }
  panel = new BrowserWindow({ width: 860, height: 700, minWidth: 620, minHeight: 480,
    title: 'Mika Companion', backgroundColor: '#11131e', show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true, nodeIntegration: false, sandbox: true, webviewTag: false,
      spellcheck: false },
  });
  const current = panel;
  current.setMenu(null);
  current.on('close', event => { if (!quitting) { event.preventDefault(); current.hide(); } });
  await loadWindow(current, false);
  current.show();
}
function recover() {
  if (!overlay) return;
  const bounds = recoverBounds(overlay.getBounds(), screen.getAllDisplays().map(d => d.workArea));
  overlay.setBounds(bounds); persist();
}
function resetPosition() {
  if (!overlay) return;
  overlay.setIgnoreMouseEvents(false);
  clickThrough = false;
  overlay.setBounds(recoverBounds(null, [screen.getPrimaryDisplay().workArea]));
  overlay.show(); shown = true; persist(); rebuildTray();
}
function rebuildTray() {
  tray?.setContextMenu(Menu.buildFromTemplate([
    { label: shown ? 'Hide companion' : 'Show companion', click: () => {
      shown = !shown; if (shown) overlay?.show(); else overlay?.hide(); rebuildTray(); } },
    { label: 'Always on top', type: 'checkbox', checked: topmost, click: item => {
      topmost = item.checked; overlay?.setAlwaysOnTop(topmost); persist(); } },
    { label: 'Click through (tray to recover)', type: 'checkbox', checked: clickThrough,
      click: item => { clickThrough = item.checked; overlay?.setIgnoreMouseEvents(clickThrough,
        { forward: true }); } },
    { type: 'separator' },
    { label: 'Microphone: off — voice setup pending', enabled: false },
    { label: 'Push to talk — voice setup pending', enabled: false },
    { label: 'Reset position / disable click through', click: resetPosition },
    { label: 'Open settings and diagnostics', click: () => { void showPanel(); } },
    { type: 'separator' },
    { label: 'Quit Mika', click: () => app.quit() },
  ]));
}
/** @param {import('electron').IpcMainInvokeEvent} event */
function verifySender(event) {
  const sender = BrowserWindow.fromWebContents(event.sender);
  if (!sender || ![panel, overlay].includes(sender) || !event.senderFrame ||
      event.senderFrame !== event.sender.mainFrame ||
      !trustedDocument(event.senderFrame.url, files, dev)) throw new Error('Untrusted IPC sender');
}
async function startBackend() {
  lastHealth = null;
  try { await backend.start(); lastHealth = await backend.request('/health'); }
  catch { /* Sanitized actionable error is in backend.snapshot(). */ }
  return status();
}
function installIPC() {
  ipcMain.handle('mika:preferences', (event, change) => {
    verifySender(event);
    if (change !== undefined && (!change || typeof change !== 'object' || Array.isArray(change)))
      throw new Error('Invalid preference change');
    return requestLocal(backend.port, backend.token, '/preferences', change ?? null);
  });
  ipcMain.handle('mika:readiness', async event => {
    verifySender(event);
    const hardware = { freeRamBytes: os.freemem(), totalRamBytes: os.totalmem() };
    const engines = { microphone: { available: false, enabled: false,
      reason: 'Capture is disabled until a local speech recognition model is prepared.' },
      voice: { available: false, reason: 'No licensed local TTS engine has been provisioned.' },
      avatar: { available: false, reason: 'No compatible licensed Live2D SDK/Core/model is provisioned.' } };
    try { return { hardware, engines, ollama: await backend.request('/models') }; }
    catch { return { hardware, engines, ollama: { available: false, models: [],
      message: 'Start the local backend before checking Ollama.' } }; }
  });
  ipcMain.handle('mika:chat-start', (event, input) => {
    verifySender(event);
    try {
      const message = validateChat(input);
      if (backend.status !== 'ready') throw new Error('Start the local backend first.');
      const requiredGiB = message.model === 'qwen3.5:9b' ? 10 : message.model === 'qwen3.5:4b' ? 6 : 2;
      if (os.freemem() < requiredGiB * 2 ** 30)
        throw new Error(`Low available RAM. Free at least ${requiredGiB} GiB before starting this model.`);
      activeChat?.abort();
      const controller = new AbortController(); activeChat = controller;
      const sequence = ++chatSequence;
      /** @param {Record<string, unknown>} payload */
      const publish = payload => {
        if (sequence === chatSequence && !event.sender.isDestroyed())
          event.sender.send('mika:chat-event', { ...payload, sequence });
      };
      void streamChat(backend.port, backend.token, message, controller.signal, publish)
        .catch(() => { if (!controller.signal.aborted)
          publish({ type: 'error', state: 'ERROR', message: 'Local conversation connection failed. Open diagnostics.' }); })
        .finally(() => { if (sequence === chatSequence) activeChat = null; });
      return { started: true, sequence };
    } catch (error) {
      return { started: false, error: error instanceof Error ? error.message : 'Could not start the local conversation.' };
    }
  });
  ipcMain.handle('mika:chat-stop', event => {
    verifySender(event); activeChat?.abort(); activeChat = null; ++chatSequence;
    event.sender.send('mika:chat-event', { type: 'state', state: 'INTERRUPTED', sequence: chatSequence });
  });
  for (const [channel, route] of [['mika:messages', '/messages'], ['mika:memories', '/memories']]) {
    ipcMain.handle(channel, event => { verifySender(event); return backend.request(route); });
  }
  ipcMain.handle('mika:memory', (event, change) => {
    verifySender(event);
    if (!change || typeof change !== 'object' || change.approved !== true ||
        !['remember', 'update', 'forget'].includes(change.operation) ||
        (change.operation !== 'forget' && (typeof change.text !== 'string' ||
          !change.text.trim() || change.text.length > 500)) ||
        (change.operation !== 'remember' && (typeof change.id !== 'string' || change.id.length !== 36))) {
      throw new Error('Invalid explicit memory change');
    }
    return requestLocal(backend.port, backend.token, '/memory', change);
  });
  ipcMain.handle('mika:memory-export', async event => {
    verifySender(event);
    const content = await backend.request('/memory-export');
    const target = await dialog.showSaveDialog({ title: 'Export approved memories',
      defaultPath: 'mika-memories.json', filters: [{ name: 'JSON', extensions: ['json'] }] });
    if (target.canceled || !target.filePath) return { saved: false };
    await fs.promises.writeFile(target.filePath, JSON.stringify(content, null, 2), 'utf8');
    return { saved: true };
  });
  ipcMain.handle('mika:history-clear', event => {
    verifySender(event);
    if (activeChat) throw new Error('Stop the active reply before deleting history.');
    return requestLocal(backend.port, backend.token, '/history-clear', {});
  });
  ipcMain.handle('mika:status', event => { verifySender(event); return status(); });
  ipcMain.handle('mika:retry', async event => {
    verifySender(event); activeChat?.abort(); activeChat = null; ++chatSequence;
    await backend.stop(); return startBackend();
  });
  ipcMain.handle('mika:diagnostics', async event => {
    verifySender(event);
    if (backend.status !== 'ready') return { ...status(), message: 'Run setup, then retry backend.' };
    try { return await backend.request('/diagnostics'); }
    catch { return { error: 'Local diagnostics unavailable; restart backend.' }; }
  });
  ipcMain.handle('mika:desktop', (event, action, value) => {
    verifySender(event);
    switch (action) {
      case 'settings': void showPanel(); break;
      case 'hide': overlay?.hide(); shown = false; break;
      case 'show': overlay?.show(); shown = true; break;
      case 'reset': resetPosition(); break;
      case 'topmost':
        if (typeof value !== 'boolean') throw new Error('Expected boolean');
        topmost = value; overlay?.setAlwaysOnTop(value); persist(); break;
      case 'clickThrough':
        if (typeof value !== 'boolean') throw new Error('Expected boolean');
        clickThrough = value; overlay?.setIgnoreMouseEvents(value, { forward: true }); break;
      case 'scale': {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0.6 || value > 1.6)
          throw new Error('Scale must be between 0.6 and 1.6');
        const bounds = { ...overlay?.getBounds(), width: 320 * value, height: 460 * value };
        overlay?.setBounds(recoverBounds(bounds, screen.getAllDisplays().map(d => d.workArea)));
        persist(); break;
      }
      case 'quit': app.quit(); break;
      default: throw new Error('Unknown desktop action');
    }
    rebuildTray(); return status();
  });
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { void showPanel(); });
  app.whenReady().then(async () => {
    session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    session.defaultSession.on('will-download', event => event.preventDefault());
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
      callback({ cancel: !allowedResource(details.url, dev, [path.join(root, 'dist'), path.join(__dirname, 'recovery')]) });
    });
    const saved = readSettings();
    topmost = typeof saved.topmost === 'boolean' ? saved.topmost : true;
    installIPC();
    overlay = new BrowserWindow({ ...recoverBounds(saved.bounds,
      screen.getAllDisplays().map(d => d.workArea)), transparent: true, frame: false,
      alwaysOnTop: topmost, resizable: true, skipTaskbar: true, show: false,
      minWidth: 240, minHeight: 300,
      webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true,
        nodeIntegration: false, sandbox: true, webviewTag: false, spellcheck: false },
    });
    overlay.on('move', scheduleSave); overlay.on('resize', scheduleSave);
    overlay.on('close', event => { if (!quitting) { event.preventDefault(); overlay?.hide(); shown = false; rebuildTray(); } });
    overlay.webContents.on('context-menu', () => tray?.popUpContextMenu());
    const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
    tray = new Tray(icon);
    tray.setToolTip('Mika — microphone off');
    tray.on('double-click', () => { resetPosition(); void showPanel(); });
    rebuildTray();
    globalShortcut.register('CommandOrControl+Shift+M', () => { resetPosition(); void showPanel(); });
    screen.on('display-removed', recover); screen.on('display-metrics-changed', recover);
    // Vue mounts issue settings/status IPC immediately; finish the local startup
    // handshake before loading either page so those calls do not race port=0.
    await startBackend();
    if (closing || quitting) return;
    await loadWindow(overlay, true);
    overlay.show();
    await showPanel();
    if (!app.isPackaged && process.env.MIKA_SMOKE_TEST === '1') {
      if (!panel) throw new Error('Mika panel did not initialize');
      const currentPanel = panel;
      const frameProof = "({ nodeExposed: typeof require !== 'undefined' || typeof process !== 'undefined', bridgePresent: typeof window.mika?.status === 'function', vueMounted: Boolean(document.querySelector('#app[data-v-app]')), security: window.mika?.security })";
      /** @param {import('electron').BrowserWindow} win */
      const windowProof = async win => {
        const frame = await win.webContents.executeJavaScript(frameProof);
        const rendererPid = win.webContents.getOSProcessId();
        return { visible: win.isVisible(), sandbox: frame.security?.sandboxed === true,
          contextIsolation: frame.security?.contextIsolated === true,
          nodeIntegration: frame.nodeExposed === true,
          rendererSandboxed: app.getAppMetrics().find(metric => metric.pid === rendererPid)?.sandboxed === true };
      };
      /** @type {Record<string, unknown>} */
      const report = { ...status(), windows: BrowserWindow.getAllWindows().length,
        renderer: await overlay.webContents.executeJavaScript(frameProof),
        panelRenderer: await currentPanel.webContents.executeJavaScript(frameProof),
        nativeWindows: { overlay: await windowProof(overlay), panel: await windowProof(currentPanel) },
        // Main-only local test artifact; no token and no renderer API exposure.
        supervision: { backendPid: backend.child?.pid ?? null, backendPort: backend.port } };
      report.ipc = await overlay.webContents.executeJavaScript(`(async () => {
        const before = await window.mika.status();
        const changed = await window.mika.desktop('topmost', !before.desktop.topmost);
        await window.mika.desktop('clickThrough', true);
        const reset = await window.mika.desktop('reset');
        await window.mika.desktop('topmost', before.desktop.topmost);
        let invalidActionRejected = false;
        try { await window.mika.desktop('shell', 'whoami'); }
        catch { invalidActionRejected = true; }
        return { topmostToggled: changed.desktop.topmost !== before.desktop.topmost,
          clickThroughRecovered: !reset.desktop.clickThrough, invalidActionRejected,
          backendReachable: before.backend.status === 'ready' && before.health?.status === 'ok' &&
            before.health?.service === 'mika-assistant',
          secretExposed: /token|port|pid/i.test(JSON.stringify(Object.keys(before))) };
      })()`);
      fs.mkdirSync(dataDir, { recursive: true });
      const image = await currentPanel.webContents.capturePage();
      fs.writeFileSync(path.join(dataDir, 'desktop-preview.png'), image.toPNG());
      fs.writeFileSync(path.join(dataDir, 'desktop-smoke.json'), JSON.stringify(report, null, 2));
      app.quit();
    }
  }).catch(async () => {
    // Avoid logging user paths, secrets, prompt data or raw exception messages.
    console.error('Mika desktop startup failed. Run scripts/doctor.ps1 and check dependencies.');
    await backend.stop(); quitting = true; app.exit(1);
  });
}
app.on('activate', () => { void showPanel(); });
app.on('window-all-closed', () => { if (quitting) app.quit(); });
app.on('before-quit', event => {
  if (quitting) return;
  event.preventDefault();
  if (closing) return;
  closing = true; activeChat?.abort(); activeChat = null; ++chatSequence; persist(); clearTimeout(writeTimer); globalShortcut.unregisterAll();
  void backend.stop().finally(() => { quitting = true; tray?.destroy(); app.quit(); });
});
