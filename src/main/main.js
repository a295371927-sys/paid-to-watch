// src/main/main.js
const { app, ipcMain, dialog, globalShortcut } = require('electron');
const { pathToFileURL } = require('node:url');
const { createMainWindow } = require('./window');
const { createTray } = require('./tray');
const { loadConfig, saveConfig } = require('./store');
const { scanFolder } = require('../core/videoScanner');

let mainWindow = null;
let tray = null; // 持有引用防止被 GC 回收导致图标消失

let config = loadConfig();

ipcMain.handle('pick-folder', async () => {
  const r = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});

// dir 直接来自渲染层,未做路径校验:单用户本地应用,渲染层即是受信代码,接受此风险。
ipcMain.handle('scan-videos', (_e, dir) => {
  if (!dir) return [];
  return scanFolder(dir).map((v) => ({ ...v, url: pathToFileURL(v.path).href }));
});

ipcMain.handle('get-config', () => config);
ipcMain.handle('set-folder', (_e, dir) => {
  config.videoFolder = dir;
  saveConfig(config);
});

ipcMain.on('fake-close', () => {
  if (!mainWindow) return;
  mainWindow.hide();
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show();
  }, 150); // 假装关掉,150ms 后又弹回
});

app.whenReady().then(() => {
  mainWindow = createMainWindow(config);

  const persistBounds = () => {
    const b = mainWindow.getBounds();
    config.window = { ...config.window, x: b.x, y: b.y, width: b.width, height: b.height };
    saveConfig(config);
  };
  mainWindow.on('moved', persistBounds);
  mainWindow.on('resized', persistBounds);

  globalShortcut.register(config.hotkey, () => {
    mainWindow.webContents.send('toggle-boss-key');
  });

  tray = createTray(mainWindow, {
    onPickFolder: () => mainWindow.webContents.send('pick-folder-from-tray'),
    onToggleShow: () => (mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()),
  });
});

app.on('window-all-closed', () => app.quit());

app.on('will-quit', () => globalShortcut.unregisterAll());