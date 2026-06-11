// src/core/config.js
const DEFAULT_CONFIG = {
  videoFolder: null,
  window: { x: null, y: null, width: 360, height: 640 },
  hotkey: 'CommandOrControl+Alt+Q',
  muted: true,
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