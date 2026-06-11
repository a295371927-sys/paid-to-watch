// src/main/window.js
const { BrowserWindow, screen } = require('electron');
const path = require('node:path');

// 依据配置在主屏右下角创建窗口。config.window 提供尺寸/可选坐标。
function createMainWindow(config) {
  const { width, height } = config.window;
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const x = config.window.x ?? sw - width - 20;
  const y = config.window.y ?? sh - height - 20;

  const win = new BrowserWindow({
    width,
    height,
    x,
    y,
    frame: false,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // preload 需要 require 项目内的 core 模块,沙盒模式下 require 被限制为内置模块
    },
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadFile(path.join(__dirname, '../renderer/index.html'));
  return win;
}

module.exports = { createMainWindow };