// src/main/main.js
const { app } = require('electron');
const { createMainWindow } = require('./window');
const { DEFAULT_CONFIG } = require('../core/config');

let mainWindow = null;

app.whenReady().then(() => {
  mainWindow = createMainWindow(DEFAULT_CONFIG);
});

app.on('window-all-closed', () => {
  app.quit();
});