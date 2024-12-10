const { app, shell, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { electronApp, optimizer, is } = require('@electron-toolkit/utils');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');
// const csvParser = require('csv-parser');

let loadedCSVData = null;
let ws = null;
let pythonServerProcess = null;
let mainWindow = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectInterval = 5000; // 5 seconds

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 800,
    icon: path.join(__dirname, '../../resources/rocket_icon.ico'),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: is.dev
        ? path.join(__dirname, '../../src/preload/index.js')
        : path.join(__dirname, 'preload/index.js'),
      contextIsolation: true,
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    // Uncomment the next line to open DevTools in the packaged app for debugging
    // mainWindow.webContents.openDevTools();
  });

  mainWindow.on('closed', () => {
    stopPythonServer();
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Load the renderer index.html file
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(
      is.dev
        ? path.join(__dirname, '../../src/renderer/index.html')
        : path.join(__dirname, 'renderer/index.html')
    );
  }

  // Update CSP to allow WebSocket connections, blob, and inline scripts/styles
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws://localhost:8080 blob: data: filesystem:;",
        ],
      },
    });
  });
}

function establishWebSocketConnection(mainWindow) {
  console.log('Attempting to establish WebSocket connection...');
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('WebSocket is already connected.');
    return;
  }

  ws = new WebSocket('ws://localhost:8080');

  ws.on('open', () => {
    console.log('WebSocket connected in main process');
    mainWindow.webContents.send('ws-connected');
    reconnectAttempts = 0; // Reset the counter on successful connection
  });

  ws.on('message', (data) => {
    mainWindow.webContents.send('ws-message', data);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    mainWindow.webContents.send('ws-error', error.message);
    attemptReconnect(mainWindow);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    mainWindow.webContents.send('ws-closed');
    attemptReconnect(mainWindow);
  });
}

function attemptReconnect(mainWindow) {
  if (reconnectAttempts < maxReconnectAttempts) {
    reconnectAttempts++;
    console.log(`Attempting to reconnect WebSocket... (${reconnectAttempts}/${maxReconnectAttempts})`);
    setTimeout(() => {
      establishWebSocketConnection(mainWindow);
    }, reconnectInterval);
  } else {
    console.log('Max reconnect attempts reached. Stopping reconnection attempts.');
  }
}

function startPythonServer() {
  return new Promise((resolve, reject) => {
    if (pythonServerProcess) {
      console.log('Python server is already running.');
      return resolve();
    }

    let pythonExecutable;
    let pythonArgs = [];

    if (app.isPackaged) {
      // Path to the packaged Python server executable
      if (process.platform === 'win32') {
        pythonExecutable = path.join(process.resourcesPath, 'pythondist', 'win', 'WS_Server.exe');
      } else if (process.platform === 'darwin') {
        pythonExecutable = path.join(process.resourcesPath, 'pythondist', 'mac', 'WS_Server');
      } else if (process.platform === 'linux') {
        pythonExecutable = path.join(process.resourcesPath, 'pythondist', 'linux', 'WS_Server');
      }
    } else {
      // Paths during development
      if (process.platform === 'win32') {
        pythonExecutable = path.join(__dirname, '../../pythondist/win/WS_Server.exe');
      } else if (process.platform === 'darwin') {
        pythonExecutable = path.join(__dirname, '../../pythondist/mac/WS_Server');
      } else if (process.platform === 'linux') {
        pythonExecutable = path.join(__dirname, '../../pythondist/linux/WS_Server');
      }
      pythonArgs = []; // Ensure pythonArgs is empty for executables
    }

    console.log('App is packaged:', app.isPackaged);
    console.log(`Starting Python server from: ${pythonExecutable}`);
    console.log(`Python server arguments: ${pythonArgs.join(' ')}`);

    // Check if the executable exists
    if (!fs.existsSync(pythonExecutable)) {
      const errorMsg = `Python executable not found at path: ${pythonExecutable}`;
      console.error(errorMsg);
      return reject(new Error(errorMsg));
    }

    pythonServerProcess = spawn(pythonExecutable, pythonArgs, {
      detached: true,
      stdio: 'pipe'
    });

    pythonServerProcess.stdout.on('data', (data) => {
      const message = data.toString();
      console.log(`Python server stdout: ${message}`);
      if (message.includes('SERVER_READY')) {
        console.log('Python server is ready. Resolving promise.');
        resolve();
      }
    });

    pythonServerProcess.stderr.on('data', (data) => {
      const message = data.toString();
      console.error(`Python server stderr: ${message}`);
    });

    pythonServerProcess.on('close', (code) => {
      console.log(`Python server exited with code ${code}`);
      if (code !== 0) {
        reject(new Error(`Python server exited with code ${code}`));
      } else {
        resolve();
      }
    });

    pythonServerProcess.on('error', (err) => {
      console.error('Failed to start Python server:', err);
      reject(err);
    });

    console.log('Python server process started.');
  });
}

function stopPythonServer() {
  if (pythonServerProcess) {
    // Send SIGINT or SIGTERM to the Python process
    process.kill(-pythonServerProcess.pid, 'SIGINT'); // Kill the process group
    pythonServerProcess = null;
    console.log('Python server stopped.');
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.example.msrc');
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  // Establish WebSocket connection immediately
  establishWebSocketConnection(mainWindow);

  // Start the Python server in the background
  startPythonServer()
    .then(() => {
      console.log('Python server is ready');
      if (mainWindow) {
        mainWindow.webContents.send('python-server-status', 'ready');
      }
    })
    .catch((error) => {
      console.error('Error starting Python server:', error);
      if (mainWindow) {
        mainWindow.webContents.send('python-server-status', 'error', error.message);
      }
    });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// IPC Handlers

// IPC Handler for 'select-file'
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'CSV Files', extensions: ['csv'] }],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null; // Return null if no file was selected
});

// IPC Handler for 'load-csv'
ipcMain.handle('load-csv', async (event, filePath) => {
  try {
    const data = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', () => {
        loadedCSVData = data;
        event.sender.send('csv-loaded', data);
      });
  } catch (error) {
    console.error('Error loading CSV:', error);
    event.sender.send('csv-loaded', null);
  }
});

// IPC Handler for 'get-csv-data'
ipcMain.on('get-csv-data', (event) => {
  event.returnValue = loadedCSVData;
});

// IPC Handler for 'ws-send'
ipcMain.on('ws-send', (event, message) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(message);
  } else {
    console.error('WebSocket is not connected.');
  }
});

// IPC Handler for 'restart-python-server'
ipcMain.on('restart-python-server', () => {
  startPythonServer()
    .then(() => {
      console.log('Python server restarted successfully');
      if (mainWindow) {
        mainWindow.webContents.send('python-server-status', 'ready');
      }
    })
    .catch((error) => {
      console.error('Error restarting Python server:', error);
      if (mainWindow) {
        mainWindow.webContents.send('python-server-status', 'error', error.message);
      }
    });
});

app.on('before-quit', () => {
  stopPythonServer();
});

app.on('window-all-closed', () => {
  stopPythonServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  stopPythonServer(); // Ensure the Python server is stopped on uncaught exceptions
});