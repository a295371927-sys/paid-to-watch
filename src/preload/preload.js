// src/preload/preload.js
const { contextBridge, ipcRenderer } = require('electron');
const { AD_TEMPLATES } = require('../core/ads');
const { nextIndex, randomOtherIndex } = require('../core/adRotator');

contextBridge.exposeInMainWorld('api', {
  ads: () => ({ AD_TEMPLATES }),
  rotator: { nextIndex, randomOtherIndex },
  pickFolder: () => ipcRenderer.invoke('pick-folder'),
  scanVideos: (dir) => ipcRenderer.invoke('scan-videos', dir),
  onBossKey: (cb) => ipcRenderer.on('toggle-boss-key', () => cb()),
  fakeClose: () => ipcRenderer.send('fake-close'),
  onPickFolderFromTray: (cb) => ipcRenderer.on('pick-folder-from-tray', () => cb()),
});
