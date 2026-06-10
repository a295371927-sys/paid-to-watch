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
const playlistEl = document.getElementById('playlist');

async function loadFolder() {
  const dir = await window.api.pickFolder();
  if (!dir) return;
  const videos = await window.api.scanVideos(dir);
  renderPlaylist(videos);
  if (videos.length) play(videos[0], 0);
}

function renderPlaylist(videos) {
  playlistEl.innerHTML = '';
  videos.forEach((v, i) => {
    const li = document.createElement('li');
    li.textContent = v.name;
    li.onclick = () => play(v, i);
    playlistEl.appendChild(li);
  });
  emptyEl.style.display = videos.length ? 'none' : 'flex';
}

function play(video, index) {
  videoEl.src = video.url;
  videoEl.classList.add('playing');
  videoEl.play();
  [...playlistEl.children].forEach((li, i) =>
    li.classList.toggle('active', i === index)
  );
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

window.api.onBossKey(() => {
  bossOn = !bossOn;
  if (bossOn) {
    renderBossAd();
    overlay.hidden = false;
    videoEl.pause();
  } else {
    overlay.hidden = true;
    videoEl.play();
  }
});

document.getElementById('fake-close').addEventListener('click', () => {
  window.api.fakeClose();
});