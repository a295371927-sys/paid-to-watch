// src/preload/hotkeyPreload.js
const { contextBridge, ipcRenderer } = require('electron');
const { buildAccelerator } = require('../core/hotkey');

contextBridge.exposeInMainWorld('api', {
  buildAccelerator,
  getCurrentHotkey: () => ipcRenderer.invoke('get-config').then((c) => c.hotkey),
  setHotkey: (accel) => ipcRenderer.invoke('set-hotkey', accel),
});