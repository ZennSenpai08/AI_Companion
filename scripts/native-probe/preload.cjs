const { contextBridge } = require('electron');
// Read-only proof from the isolated preload; no filesystem, IPC or commands exposed.
contextBridge.exposeInMainWorld('nativeProbeSecurity', Object.freeze({
  sandboxed: process.sandboxed === true,
  contextIsolated: process.contextIsolated === true,
}));
