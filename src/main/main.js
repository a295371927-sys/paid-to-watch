// src/main/main.js
const { app, ipcMain, dialog } = require('electron');
const { pathToFileURL } = require('node:url');
const { createMainWindow } = require('./window');
const { DEFAULT_CONFIG } = require('../core/config');
const { scanFolder } = require('../core/videoScanner');

let mainWindow = null;

ipcMain.handle('pick-folder', async () => {
  const r = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});

// dir 直接来自渲染层,未做路径校验:单用户本地应用,渲染层即是受信代码,接受此风险。
ipcMain.handle('scan-videos', (_e, dir) => {
  if (!dir) return [];
  return scanFolder(dir).map((v) => ({ ...v, url: pathToFileURL(v.path).href }));
});

app.whenReady().then(() => {
  mainWindow = createMainWindow(DEFAULT_CONFIG);
});

app.on('window-all-closed', () => app.quit());