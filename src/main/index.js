import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import rocketIcon from '../../resources/rocket_icon.ico?asset'
const { dialog } = require('electron')
const fs = require('fs')
const WebSocket = require('ws')

let loadedCSVData = null
let ws = null

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1050,
    height: 800,
    icon: rocketIcon,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'), // Use preload script
      contextIsolation: true, // Enable context isolation
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

  // Update CSP to allow WebSocket connections, blob, and inline scripts/styles
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws://localhost:8080 blob: data: filesystem:;"
        ]
      }
    })
  })

  // Establish WebSocket connection
  ws = new WebSocket('ws://localhost:8080')

  ws.on('open', () => {
    console.log('WebSocket connected in main process')
  })

  ws.on('message', (data) => {
    mainWindow.webContents.send('ws-message', data)
  })

  ipcMain.on('ws-send', (event, message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message)
    }
  })
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
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    })
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null // Return null if no file was selected
  })

  // IPC Load CSV
  ipcMain.handle('load-csv', async (event, filePath) => {
    try {
      const data = []
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          data.push(row)
        })
        .on('end', () => {
          loadedCSVData = data
          event.sender.send('csv-loaded', data)
        })
    } catch (error) {
      console.error('Error loading CSV:', error)
      event.sender.send('csv-loaded', null)
    }
  })

  // IPC Get CSV Data
  ipcMain.on('get-csv-data', (event) => {
    event.returnValue = loadedCSVData
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