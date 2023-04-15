import { app, BrowserWindow } from 'electron';
import * as path from 'path';

let mainWindow: Electron.BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1024,
    minHeight: 820,
    backgroundColor: "#101820ff",
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    },
    autoHideMenuBar: true,
    frame: false,
  });

  // Load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually one would store windows
    // in an array if the app supports multi windows, this is the time
    // when the corresponding element should be deleted.
    mainWindow = null;
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
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