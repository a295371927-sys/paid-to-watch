// src/core/config.js
const DEFAULT_CONFIG = {
  videoFolder: null,
  window: { x: null, y: null, width: 360, height: 640 },
  hotkey: 'CommandOrControl+Alt+Q',
  muted: true,
  liveUrl: 'https://tv.cctv.com/live/cctv5/',
  liveMuted: true,
  favoriteSites: [
    { name: 'CCTV5 直播', url: 'https://tv.cctv.com/live/cctv5/' },
    { name: '咪咕视频', url: 'https://www.miguvideo.com/' },
    { name: 'B 站直播', url: 'https://live.bilibili.com/' },
  ],
};

function mergeConfig(saved) {
  if (!saved || typeof saved !== 'object') {
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
  return {
    ...DEFAULT_CONFIG,
    ...saved,
    window: { ...DEFAULT_CONFIG.window, ...(saved.window || {}) },
  };
}

module.exports = { DEFAULT_CONFIG, mergeConfig };