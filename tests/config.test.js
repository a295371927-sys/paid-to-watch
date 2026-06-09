import { describe, it, expect } from 'vitest';
import config from '../src/core/config.js';

const { DEFAULT_CONFIG, mergeConfig } = config;

describe('mergeConfig', () => {
  it('空输入返回默认配置副本', () => {
    expect(mergeConfig(null)).toEqual(DEFAULT_CONFIG);
    expect(mergeConfig(undefined)).toEqual(DEFAULT_CONFIG);
    expect(mergeConfig(null)).not.toBe(DEFAULT_CONFIG);
  });
  it('用户值覆盖默认值', () => {
    const merged = mergeConfig({ videoFolder: '/v', muted: false });
    expect(merged.videoFolder).toBe('/v');
    expect(merged.muted).toBe(false);
    expect(merged.hotkey).toBe(DEFAULT_CONFIG.hotkey);
  });
  it('window 子对象做浅合并而非整体替换', () => {
    const merged = mergeConfig({ window: { x: 10, y: 20 } });
    expect(merged.window.x).toBe(10);
    expect(merged.window.width).toBe(DEFAULT_CONFIG.window.width);
  });
});