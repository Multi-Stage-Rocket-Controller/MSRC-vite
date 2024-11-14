// Main/index.js-1
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import rocketIcon from '../../resources/rocket_icon.ico?asset'
const { dialog } = require('electron')
const fs = require('fs')

let loadedJSONData = null

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    icon: rocketIcon,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC File Explorer
  ipcMain.handle('select-file', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    })
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null // Return null if no file was selected
  })

  // IPC Load JSON
  ipcMain.handle('load-json', async (event, filePath) => {
    try {
      const data = fs.readFileSync(filePath, 'utf-8')
      loadedJSONData = JSON.parse(data)
      return loadedJSONData
    } catch (error) {
      console.error('Error loading JSON:', error)
      return null
    }
  })

  // IPC Get JSON Data
  ipcMain.on('get-json-data', (event) => {
    event.returnValue = loadedJSONData
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})