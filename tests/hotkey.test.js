import { describe, it, expect } from 'vitest';
import hotkey from '../src/core/hotkey.js';

const { buildAccelerator } = hotkey;

describe('buildAccelerator', () => {
  it('组合修饰键 + 字母 → accelerator 字符串', () => {
    expect(buildAccelerator({ ctrl: true, alt: true, shift: false, key: 'q' })).toBe(
      'CommandOrControl+Alt+Q'
    );
  });

  it('字母自动转大写', () => {
    expect(buildAccelerator({ ctrl: false, alt: true, shift: false, key: 'w' })).toBe('Alt+W');
  });

  it('支持功能键', () => {
    expect(buildAccelerator({ ctrl: false, alt: true, shift: false, key: 'F5' })).toBe('Alt+F5');
  });

  it('三个修饰键同时按下', () => {
    expect(buildAccelerator({ ctrl: true, alt: true, shift: true, key: '1' })).toBe(
      'CommandOrControl+Alt+Shift+1'
    );
  });

  it('没有修饰键 → 无效', () => {
    expect(buildAccelerator({ ctrl: false, alt: false, shift: false, key: 'q' })).toBeNull();
  });

  it('没有按下普通键 → 无效', () => {
    expect(buildAccelerator({ ctrl: true, alt: false, shift: false, key: null })).toBeNull();
  });

  it('按下的是修饰键本身 → 无效', () => {
    expect(buildAccelerator({ ctrl: true, alt: false, shift: false, key: 'Control' })).toBeNull();
  });
});