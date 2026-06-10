// src/preload/preload.js
const { contextBridge } = require('electron');
const { AD_TEMPLATES } = require('../core/ads');
const { nextIndex, randomOtherIndex } = require('../core/adRotator');

contextBridge.exposeInMainWorld('api', {
  ads: () => ({ AD_TEMPLATES }),
  rotator: { nextIndex, randomOtherIndex },
});
