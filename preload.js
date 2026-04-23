const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send('set-ignore-mouse-events', ignore, options),
  runOpenclawCmd: (action) => ipcRenderer.invoke('run-openclaw-cmd', action),
  quitApp: () => ipcRenderer.send('quit-app')
});
