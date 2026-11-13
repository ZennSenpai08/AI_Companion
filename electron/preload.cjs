const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('mika', Object.freeze({
/** @param {object} input */
  sendText: input => ipcRenderer.invoke('mika:chat-start', input),
  stopText: () => ipcRenderer.invoke('mika:chat-stop'),
  messages: () => ipcRenderer.invoke('mika:messages'),
  memories: () => ipcRenderer.invoke('mika:memories'),
/** @param {object} change */
  memory: change => ipcRenderer.invoke('mika:memory', change),
  exportMemories: () => ipcRenderer.invoke('mika:memory-export'),
  clearHistory: () => ipcRenderer.invoke('mika:history-clear'),
/** @param {(payload:Record<string, unknown>)=>void} callback */
  onChatEvent: callback => {
    /** @param {import('electron').IpcRendererEvent} _event @param {Record<string, unknown>} payload */
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('mika:chat-event', listener);
    return () => ipcRenderer.removeListener('mika:chat-event', listener);
  },
  /** @param {Record<string, unknown>} [change] */
  preferences: change => ipcRenderer.invoke('mika:preferences', change),
  readiness: () => ipcRenderer.invoke('mika:readiness'),
  status: () => ipcRenderer.invoke('mika:status'),
  retryBackend: () => ipcRenderer.invoke('mika:retry'),
  diagnostics: () => ipcRenderer.invoke('mika:diagnostics'),
  /** @param {string} action @param {boolean | number} [value] */
  desktop: (action, value) => ipcRenderer.invoke('mika:desktop', action, value),
}));
