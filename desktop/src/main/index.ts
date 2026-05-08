import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      // electron-vite ships preloads as CommonJS importing from `electron`;
      // sandbox: true would force a polyfilled subset that doesn't bundle
      // cleanly. contextIsolation: true above is what actually keeps the
      // renderer at arm's length, and our preload exposes only a typed
      // bridge to electron's own APIs — no remote content, no fs access.
      sandbox: false,
    },
  });
  win.on('ready-to-show', () => win.show());
  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
