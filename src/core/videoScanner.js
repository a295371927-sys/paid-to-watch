// src/core/videoScanner.js
const fs = require('node:fs');
const path = require('node:path');

const VIDEO_EXTS = new Set(['.mp4', '.webm', '.ogv', '.m4v']);

function isVideoFile(name) {
  return VIDEO_EXTS.has(path.extname(name).toLowerCase());
}

function filterVideos(names) {
  return names.filter(isVideoFile);
}

// readdir 可注入以便测试,默认同步读取目录。
function scanFolder(dir, readdir = fs.readdirSync) {
  return filterVideos(readdir(dir)).map((name) => ({
    name,
    path: path.join(dir, name),
  }));
}

module.exports = { isVideoFile, filterVideos, scanFolder, VIDEO_EXTS };
