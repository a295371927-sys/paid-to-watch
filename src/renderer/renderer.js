// src/renderer/renderer.js
const { AD_TEMPLATES } = window.api.ads();
const { nextIndex } = window.api.rotator;

let topIdx = 0;
let bottomIdx = Math.floor(AD_TEMPLATES.length / 2);

function renderBanner(el, ad) {
  el.style.background = ad.bg;
  el.innerHTML =
    `<div class="ad-title">${ad.title}</div>` +
    `<div class="ad-sub">${ad.subtitle}</div>` +
    `<div class="ad-btn">${ad.button}</div>`;
}

function paintAds() {
  renderBanner(document.getElementById('ad-top'), AD_TEMPLATES[topIdx]);
  renderBanner(document.getElementById('ad-bottom'), AD_TEMPLATES[bottomIdx]);
}

function rotateAds() {
  topIdx = nextIndex(topIdx, AD_TEMPLATES.length);
  bottomIdx = nextIndex(bottomIdx, AD_TEMPLATES.length);
  paintAds();
}

paintAds();
setInterval(rotateAds, 6000); // 每 6s 轮播一次,模拟真广告刷新

const videoEl = document.getElementById('video');
const emptyEl = document.getElementById('video-empty');

let videos = [];
let currentIndex = 0;

async function loadFolder() {
  const dir = await window.api.pickFolder();
  if (!dir) return;
  await window.api.setFolder(dir);
  await openFolder(dir);
}

async function openFolder(dir) {
  videos = await window.api.scanVideos(dir);
  emptyEl.style.display = videos.length ? 'none' : 'flex';
  if (videos.length) play(videos[0], 0);
}

function play(video, index) {
  currentIndex = index;
  videoEl.src = video.url;
  videoEl.classList.add('playing');
  videoEl.play();
}

// 播完当前视频 → 切到下一个(循环);多个视频靠这个顺序播放,不展示文件名列表
function playNext() {
  if (!videos.length) return;
  play(videos[(currentIndex + 1) % videos.length], (currentIndex + 1) % videos.length);
}

// 临时:双击视频区触发选择文件夹(Task 10 改由托盘菜单触发)
document.getElementById('stage').addEventListener('dblclick', loadFolder);

// 暴露给托盘任务复用
window.__loadFolder = loadFolder;

const { randomOtherIndex } = window.api.rotator;
const overlay = document.getElementById('boss-overlay');
let bossOn = false;

function renderBossAd() {
  const ad = AD_TEMPLATES[randomOtherIndex(topIdx, AD_TEMPLATES.length)];
  overlay.style.background = ad.bg;
  overlay.innerHTML =
    `<div class="b-title">${ad.title}</div>` +
    `<div class="ad-sub">${ad.subtitle}</div>` +
    `<div class="b-btn">${ad.button}</div>`;
}

function showAd() {
  bossOn = true;
  renderBossAd();
  overlay.hidden = false;
  videoEl.pause();
}

window.api.onBossKey(() => {
  if (bossOn) {
    bossOn = false;
    overlay.hidden = true;
    if (videoEl.ended) {
      playNext();
    } else {
      videoEl.play();
    }
  } else {
    showAd();
  }
});

// 视频自然播完 → 自动切到全屏假广告(和按老板键效果一样)
videoEl.addEventListener('ended', () => {
  if (!bossOn) showAd();
});

document.getElementById('fake-close').addEventListener('click', () => {
  window.api.fakeClose();
});

window.api.onPickFolderFromTray(() => window.__loadFolder());

// 启动时:有记住的文件夹就直接加载
(async () => {
  const cfg = await window.api.getConfig();
  if (cfg.videoFolder) await openFolder(cfg.videoFolder);
})();