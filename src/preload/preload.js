// src/preload/preload.js
const { contextBridge, ipcRenderer } = require('electron');
const { AD_TEMPLATES } = require('../core/ads');
const { nextIndex, randomOtherIndex } = require('../core/adRotator');

contextBridge.exposeInMainWorld('api', {
  ads: () => ({ AD_TEMPLATES }),
  rotator: { nextIndex, randomOtherIndex },
  pickFolder: () => ipcRenderer.invoke('pick-folder'),
  scanVideos: (dir) => ipcRenderer.invoke('scan-videos', dir),
  getConfig: () => ipcRenderer.invoke('get-config'),
  setFolder: (dir) => ipcRenderer.invoke('set-folder', dir),
  onBossKey: (cb) => ipcRenderer.on('toggle-boss-key', () => cb()),
  fakeClose: () => ipcRenderer.send('fake-close'),
  onPickFolderFromTray: (cb) => ipcRenderer.on('pick-folder-from-tray', () => cb()),
  onToggleLive: (cb) => ipcRenderer.on('toggle-live', (_e, on) => cb(on)),
  navigateLive: (url) => ipcRenderer.send('navigate-live', url),
  onSetupMode: (cb) => ipcRenderer.on('setup-mode', (_e, on) => cb(on)),
});
