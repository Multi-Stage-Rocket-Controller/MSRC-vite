import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const rocketAPI = {
  openFile: async () => await ipcRenderer.invoke('select-file'),
  loadJSON: async (filePath) => await ipcRenderer.invoke('load-json', filePath),
  getJSONData: () => ipcRenderer.sendSync('get-json-data')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('rocket', rocketAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.rocket = rocketAPI
}