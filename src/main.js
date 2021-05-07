const { app, BrowserWindow, ipcMain, Notification, nativeImage } = require("electron");
const path = require('path')
const EventEmitter = require('events')
require('update-electron-app')()

function createWindow () {

  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    frame: true,
    icon : "../icon.ico",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  return win;
  
}

app.whenReady().then(() => {
  const window = createWindow();
  window.loadFile(path.join(path.dirname(__dirname),'views/index.html'));
  
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


ipcMain.handle('show-notification', (event, ...args) => {
  const notification = {
      title: args[0],
      body: args[1]
  }
  new Notification(notification).show()
});
