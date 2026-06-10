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