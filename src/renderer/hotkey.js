// src/renderer/hotkey.js
const currentEl = document.getElementById('current');
const previewEl = document.getElementById('preview');
const errorEl = document.getElementById('error');
const saveBtn = document.getElementById('save');
const cancelBtn = document.getElementById('cancel');

let pendingAccel = null;

window.api.getCurrentHotkey().then((hk) => {
  currentEl.textContent = hk.replace('CommandOrControl', 'Ctrl');
});

document.addEventListener('keydown', (e) => {
  e.preventDefault();
  const accel = window.api.buildAccelerator({
    ctrl: e.ctrlKey,
    alt: e.altKey,
    shift: e.shiftKey,
    key: e.key,
  });
  if (accel) {
    pendingAccel = accel;
    previewEl.textContent = accel.replace('CommandOrControl', 'Ctrl');
    errorEl.textContent = '';
    saveBtn.disabled = false;
  } else {
    pendingAccel = null;
    previewEl.textContent = '组合无效,至少需要 Ctrl/Alt/Shift + 一个字母/数字/F键';
    saveBtn.disabled = true;
  }
});

saveBtn.addEventListener('click', async () => {
  if (!pendingAccel) return;
  const result = await window.api.setHotkey(pendingAccel);
  if (result.success) {
    window.close();
  } else {
    errorEl.textContent = result.message;
  }
});

cancelBtn.addEventListener('click', () => window.close());