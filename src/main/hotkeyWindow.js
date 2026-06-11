// src/main/hotkeyWindow.js
const { BrowserWindow } = require('electron');
const path = require('node:path');

function openHotkeyWindow() {
  const win = new BrowserWindow({
    width: 320,
    height: 220,
    resizable: false,
    center: true,
    title: '设置老板键',
    webPreferences: {
      preload: path.join(__dirname, '../preload/hotkeyPreload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, '../renderer/hotkey.html'));
  return win;
}

module.exports = { openHotkeyWindow };