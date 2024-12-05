// main/index.js
const { app, shell, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { electronApp, optimizer, is } = require('@electron-toolkit/utils');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');
const csvParser = require('csv-parser');

let loadedCSVData = null;
let ws = null;
let pythonServerProcess = null;
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1090,
    height: 800,
    minWidth:1070,
    minHeight: 650,
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
  });

  ws.on('message', (data) => {
    mainWindow.webContents.send('ws-message', data);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    mainWindow.webContents.send('ws-error', error.message);
    // Attempt to reconnect after a delay
    setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      establishWebSocketConnection(mainWindow);
    }, 1000); // Retry after 1 second
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    mainWindow.webContents.send('ws-closed');
    // Attempt to reconnect after a delay
    setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      establishWebSocketConnection(mainWindow);
    }, 1000); // Retry after 1 second
  });
}

function startPythonServer() {
  return new Promise((resolve, reject) => {
    let pythonExecutable;
    let pythonArgs = [];

    if (app.isPackaged) {
      // Path to the packaged Python server executable
      if (process.platform === 'win32') {
        pythonExecutable = path.join(process.resourcesPath, 'python-dist', 'serial.exe');
      } else if (process.platform === 'darwin') {
        pythonExecutable = path.join(process.resourcesPath, 'python-dist', 'serial');
      } else if (process.platform === 'linux') {
        pythonExecutable = path.join(process.resourcesPath, 'python-dist', 'serial');
      }
    } else {
      // Paths during development
      const pythonScriptPath = path.join(__dirname, '../../src/python-server/serial.py');
      pythonExecutable = process.platform !== 'win32' ? 'python3' : 'python';
      pythonArgs = [pythonScriptPath];
    }

    console.log('App is packaged:', app.isPackaged);
    console.log(`Starting Python server from: ${pythonExecutable}`);

    // Check if the executable exists
    if (app.isPackaged && !fs.existsSync(pythonExecutable)) {
      const errorMsg = `Python executable not found at path: ${pythonExecutable}`;
      console.error(errorMsg);
      return reject(new Error(errorMsg));
    }

    if (app.isPackaged) {
      // When packaged, execute the bundled executable directly
      pythonServerProcess = spawn(pythonExecutable);
    } else {
      // During development, run the script with Python
      pythonServerProcess = spawn(pythonExecutable, pythonArgs);
    }

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
    pythonServerProcess.kill();
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
  // Optionally, show a dialog or notification to the user
});
