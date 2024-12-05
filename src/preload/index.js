// preload/index.js
const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
  ipcRenderer: {
    invoke: ipcRenderer.invoke.bind(ipcRenderer),
    send: ipcRenderer.send.bind(ipcRenderer),
    on: ipcRenderer.on.bind(ipcRenderer),
    once: ipcRenderer.once.bind(ipcRenderer),
    removeListener: ipcRenderer.removeListener.bind(ipcRenderer),
    removeAllListeners: ipcRenderer.removeAllListeners.bind(ipcRenderer),
  },
};

const rocketAPI = {
  openFile: async () => await ipcRenderer.invoke('select-file'),
  loadCSV: async (filePath) => await ipcRenderer.invoke('load-csv', filePath),
  getCSVData: () => ipcRenderer.sendSync('get-csv-data'),
  sendWebSocketMessage: (message) => ipcRenderer.send('ws-send', message),
};

contextBridge.exposeInMainWorld('electron', electronAPI);
contextBridge.exposeInMainWorld('rocket', rocketAPI);
