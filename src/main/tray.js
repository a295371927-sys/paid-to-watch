// src/main/tray.js
const { Tray, Menu, app } = require('electron');
const path = require('node:path');

// callbacks: { onPickFolder, onToggleShow, onSetHotkey, onToggleLive, onToggleLiveSound, onToggleSetupMode, onSelectFavorite }
// state: { liveOn, liveMuted, setupMode, favoriteSites }
function buildMenu(callbacks, state) {
  return Menu.buildFromTemplate([
    { label: '选择视频文件夹', click: () => callbacks.onPickFolder() },
    { label: '显示 / 隐藏', click: () => callbacks.onToggleShow() },
    { label: '设置老板键', click: () => callbacks.onSetHotkey() },
    { type: 'separator' },
    { label: '网页直播', type: 'checkbox', checked: state.liveOn, click: () => callbacks.onToggleLive() },
    { label: '直播声音', type: 'checkbox', checked: !state.liveMuted, click: () => callbacks.onToggleLiveSound() },
    {
      label: '直播设置模式(放大窗口便于操作)',
      type: 'checkbox',
      checked: state.setupMode,
      click: () => callbacks.onToggleSetupMode(),
    },
    {
      label: '收藏网站',
      submenu: state.favoriteSites.map((site) => ({
        label: site.name,
        click: () => callbacks.onSelectFavorite(site.url),
      })),
    },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() },
  ]);
}

function createTray(callbacks, state) {
  const tray = new Tray(path.join(__dirname, '../../assets/tray.png'));
  tray.setToolTip('带薪看片');
  tray.setContextMenu(buildMenu(callbacks, state));
  return tray;
}

function refreshTray(tray, callbacks, state) {
  tray.setContextMenu(buildMenu(callbacks, state));
}

module.exports = { createTray, refreshTray };
