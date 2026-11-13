const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('visibleProbeSecurity', Object.freeze({
  sandboxed: process.sandboxed === true,
  contextIsolated: process.contextIsolated === true,
}));
