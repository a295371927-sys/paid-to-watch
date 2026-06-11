// src/main/tray.js
const { Tray, Menu, app } = require('electron');
const path = require('node:path');

// callbacks: { onPickFolder, onToggleShow }
function createTray(win, callbacks) {
  const tray = new Tray(path.join(__dirname, '../../assets/tray.png'));
  const menu = Menu.buildFromTemplate([
    { label: '选择视频文件夹', click: () => callbacks.onPickFolder() },
    { label: '显示 / 隐藏', click: () => callbacks.onToggleShow() },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() },
  ]);
  tray.setToolTip('带薪看片');
  tray.setContextMenu(menu);
  return tray;
}

module.exports = { createTray };
