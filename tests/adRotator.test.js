import { describe, it, expect } from 'vitest';
import rotator from '../src/core/adRotator.js';

const { nextIndex, randomOtherIndex } = rotator;

describe('nextIndex', () => {
  it('正常自增', () => {
    expect(nextIndex(0, 5)).toBe(1);
  });
  it('到末尾循环回 0', () => {
    expect(nextIndex(4, 5)).toBe(0);
  });
  it('长度为 0 时返回 0', () => {
    expect(nextIndex(0, 0)).toBe(0);
  });
});

describe('randomOtherIndex', () => {
  it('结果落在范围内且不等于当前', () => {
    const seq = [0, 0.5];
    let i = 0;
    const rand = () => seq[i++];
    expect(randomOtherIndex(0, 5, rand)).toBe(2);
  });
  it('长度为 1 时返回 0', () => {
    expect(randomOtherIndex(0, 1)).toBe(0);
  });
});
