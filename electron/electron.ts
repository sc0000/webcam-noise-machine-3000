// Copyright 2025 Sebastian Cyliax

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1024,
    minHeight: 820,
    backgroundColor: "#101820ff",
    minimizable: true,
    maximizable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: true,
      nodeIntegration: true,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    frame: false,
    icon: path.join(__dirname, '../src/assets/tray-big2.png'),
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Event listeners for ipcMain to handle events from the renderer process
  ipcMain.on("minimizeWindow", () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.on("maximizeWindow", () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.restore();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on("closeWindow", () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  // Send window maximized state to renderer process
  ipcMain.on('get-window-maximized-state', (event) => {
    if (mainWindow) {
      const isMaximized = mainWindow.isMaximized();
      event.reply('window-maximized-state', isMaximized);
    }
  });
}

app.on("ready", createWindow);

app.on('window-all-closed', () => {
  // On OS X it is common for apps and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the 
  // dock icon is clicked and there are no other windows open
  if (mainWindow === null) {
    createWindow();
  }
});
