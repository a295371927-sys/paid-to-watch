// src/main/main.js
const { app, ipcMain, dialog, globalShortcut, BrowserView } = require('electron');
const { pathToFileURL } = require('node:url');
const { createMainWindow } = require('./window');
const { createTray, refreshTray } = require('./tray');
const { openHotkeyWindow } = require('./hotkeyWindow');
const { loadConfig, saveConfig } = require('./store');
const { scanFolder } = require('../core/videoScanner');

// 与 style.css 中 .ad-banner / .titlebar / .addr-bar 的尺寸保持一致
const AD_BANNER_HEIGHT = 70;
const TITLEBAR_HEIGHT = 22;
const ADDR_BAR_HEIGHT = 32;

let mainWindow = null;
let tray = null;
let liveView = null;
let liveLoaded = false;
let bossOn = false;

let config = loadConfig();
const liveState = {
  liveOn: false,
  liveMuted: config.liveMuted,
  setupMode: false,
  favoriteSites: config.favoriteSites,
};

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

// 直播区域 = 整窗减去上下假广告和标题条,对应 .stage 在窗口中的位置
// 设置模式下还要再让出顶部地址栏的空间
function stageBounds() {
  const { width, height } = mainWindow.getBounds();
  const addrH = liveState.setupMode ? ADDR_BAR_HEIGHT : 0;
  return {
    x: 0,
    y: AD_BANNER_HEIGHT + addrH,
    width,
    height: Math.max(0, height - AD_BANNER_HEIGHT * 2 - TITLEBAR_HEIGHT - addrH),
  };
}

// 老板键按下 或 直播关闭 时把 BrowserView 缩成 0 大小隐藏掉(网页全屏也只会铺满这块区域,不影响假广告)
function updateLiveView() {
  if (!liveView) return;
  if (liveState.liveOn && !bossOn) {
    liveView.setBounds(stageBounds());
    liveView.webContents.setAudioMuted(liveState.liveMuted);
  } else {
    liveView.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    if (liveState.liveOn) liveView.webContents.setAudioMuted(true); // 老板键期间强制静音
  }
}

function registerHotkey(accel) {
  return globalShortcut.register(accel, () => {
    bossOn = !bossOn;
    mainWindow.webContents.send('toggle-boss-key');
    updateLiveView();
  });
}

ipcMain.handle('set-hotkey', (_e, accel) => {
  globalShortcut.unregister(config.hotkey);
  if (!registerHotkey(accel)) {
    registerHotkey(config.hotkey); // 注册失败(组合被占用),恢复旧热键
    return { success: false, message: '该组合键已被占用或无效,请换一个' };
  }
  config.hotkey = accel;
  saveConfig(config);
  return { success: true };
});

app.whenReady().then(() => {
  mainWindow = createMainWindow(config);

  let savedBounds = null;

  let persistBoundsTimer = null;
  const persistBounds = () => {
    if (liveState.setupMode) return; // 设置模式下的临时大窗口不写入伪装窗口的尺寸配置
    clearTimeout(persistBoundsTimer);
    persistBoundsTimer = setTimeout(() => {
      const b = mainWindow.getBounds();
      config.window = { ...config.window, x: b.x, y: b.y, width: b.width, height: b.height };
      saveConfig(config);
    }, 200); // 防抖:拖动/缩放过程中避免高频写盘
  };
  mainWindow.on('moved', persistBounds);
  mainWindow.on('resized', persistBounds);
  mainWindow.on('resize', updateLiveView); // 窗口尺寸变化时,直播区域跟着重新铺满 .stage

  // 网页直播用 BrowserView 叠加在 .stage 区域上方,而不是 <webview>:
  // 网页内容全屏时只会铺满 BrowserView 的 bounds(即 .stage 区域),不会盖住上下假广告或影响主窗口尺寸。
  liveView = new BrowserView({
    webPreferences: { contextIsolation: true, sandbox: true, partition: 'persist:live' },
  });
  mainWindow.addBrowserView(liveView);
  liveView.setBounds({ x: 0, y: 0, width: 0, height: 0 });
  liveView.webContents.on('enter-html-full-screen', () => {
    liveView.setBounds(stageBounds());
    setTimeout(() => liveView.setBounds(stageBounds()), 50);
  });
  liveView.webContents.on('leave-html-full-screen', () => {
    liveView.setBounds(stageBounds());
    setTimeout(() => liveView.setBounds(stageBounds()), 50);
  });

  registerHotkey(config.hotkey);

  // 跳转直播区到任意网址(地址栏 / 收藏网站共用):若直播尚未开启则顺带开启
  function goToUrl(rawUrl) {
    if (!rawUrl) return;
    const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    liveView.webContents.loadURL(url);
    liveLoaded = true;
    if (!liveState.liveOn) {
      liveState.liveOn = true;
      mainWindow.webContents.send('toggle-live', true);
      refreshTray(tray, callbacks, liveState);
    }
    updateLiveView();
  }

  const callbacks = {
    onPickFolder: () => mainWindow.webContents.send('pick-folder-from-tray'),
    onToggleShow: () => (mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()),
    onSetHotkey: () => openHotkeyWindow(),
    onToggleLive: () => {
      liveState.liveOn = !liveState.liveOn;
      if (liveState.liveOn && !liveLoaded) {
        liveView.webContents.loadURL(config.liveUrl);
        liveView.webContents.once('did-finish-load', () => liveView.webContents.setZoomFactor(0.6));
        liveLoaded = true;
      }
      mainWindow.webContents.send('toggle-live', liveState.liveOn);
      updateLiveView();
      refreshTray(tray, callbacks, liveState);
    },
    onToggleLiveSound: () => {
      liveState.liveMuted = !liveState.liveMuted;
      config.liveMuted = liveState.liveMuted;
      saveConfig(config);
      updateLiveView();
      refreshTray(tray, callbacks, liveState);
    },
    onToggleSetupMode: () => {
      liveState.setupMode = !liveState.setupMode;
      if (liveState.setupMode) {
        savedBounds = mainWindow.getBounds();
        mainWindow.setAlwaysOnTop(false);
        mainWindow.setSkipTaskbar(false);
        const { width: sw, height: sh } = require('electron').screen.getPrimaryDisplay().workAreaSize;
        const width = 1200;
        const height = 800;
        mainWindow.setBounds({
          x: Math.round((sw - width) / 2),
          y: Math.round((sh - height) / 2),
          width,
          height,
        });
      } else {
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
        mainWindow.setSkipTaskbar(true);
        if (savedBounds) mainWindow.setBounds(savedBounds);
      }
      mainWindow.webContents.send('setup-mode', liveState.setupMode);
      updateLiveView();
      refreshTray(tray, callbacks, liveState);
    },
    onSelectFavorite: (url) => goToUrl(url),
  };

  ipcMain.on('navigate-live', (_e, rawUrl) => goToUrl(rawUrl));

  tray = createTray(callbacks, liveState);
});

app.on('window-all-closed', () => app.quit());

app.on('will-quit', () => globalShortcut.unregisterAll());
