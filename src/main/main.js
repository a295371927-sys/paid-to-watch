// src/main/main.js
const { app, ipcMain, dialog, globalShortcut } = require('electron');
const { pathToFileURL } = require('node:url');
const { createMainWindow } = require('./window');
const { createTray } = require('./tray');
const { DEFAULT_CONFIG } = require('../core/config');
const { scanFolder } = require('../core/videoScanner');

let mainWindow = null;
let tray = null;

ipcMain.handle('pick-folder', async () => {
  const r = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});

// dir 直接来自渲染层,未做路径校验:单用户本地应用,渲染层即是受信代码,接受此风险。
ipcMain.handle('scan-videos', (_e, dir) => {
  if (!dir) return [];
  return scanFolder(dir).map((v) => ({ ...v, url: pathToFileURL(v.path).href }));
});

ipcMain.on('fake-close', () => {
  if (!mainWindow) return;
  mainWindow.hide();
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show();
  }, 150); // 假装关掉,150ms 后又弹回
});

app.whenReady().then(() => {
  mainWindow = createMainWindow(DEFAULT_CONFIG);

  globalShortcut.register(DEFAULT_CONFIG.hotkey, () => {
    mainWindow.webContents.send('toggle-boss-key');
  });

  tray = createTray(mainWindow, {
    onPickFolder: () => mainWindow.webContents.send('pick-folder-from-tray'),
    onToggleShow: () => (mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()),
  });
});

app.on('window-all-closed', () => app.quit());

app.on('will-quit', () => globalShortcut.unregisterAll());