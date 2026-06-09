// src/core/adRotator.js

// 顺序下一条,循环。
function nextIndex(current, length) {
  if (length <= 0) return 0;
  return (current + 1) % length;
}

// 随机选一条与 current 不同的;length<=1 时只能返回 0。
// rand 可注入以便测试,默认 Math.random。
function randomOtherIndex(current, length, rand = Math.random) {
  if (length <= 1) return 0;
  let i;
  do {
    i = Math.floor(rand() * length);
  } while (i === current);
  return i;
}

module.exports = { nextIndex, randomOtherIndex };
