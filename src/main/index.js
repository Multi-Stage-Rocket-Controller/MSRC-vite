import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import rocketIcon from '../../resources/rocket_icon.ico?asset'
const { dialog } = require('electron')
const fs = require('fs')

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

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('file', async (event) => {
    console.log('in fileSearch')
    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    })
    if (!result.canceled && result.filePaths.length > 0) {
      event.sender.send('file-selected', result.filePaths[0])
    }
  })
  // IPC File Explorer
  ipcMain.handle('get-sim-file', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    })
    console.log('get-sim-file RESULT: ', result)
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
