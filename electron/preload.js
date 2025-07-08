const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Menu actions
  onMenuNewTender: (callback) => ipcRenderer.on('menu-new-tender', callback),
  
  // Application info
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // File operations (if needed)
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // Remove all listeners (cleanup)
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});