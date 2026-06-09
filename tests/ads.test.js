import { describe, it, expect } from 'vitest';
import ads from '../src/core/ads.js';

const { AD_TEMPLATES } = ads;

describe('AD_TEMPLATES', () => {
  it('至少有 5 套模板', () => {
    expect(AD_TEMPLATES.length).toBeGreaterThanOrEqual(5);
  });

  it('每套模板都有渲染所需字段', () => {
    for (const ad of AD_TEMPLATES) {
      expect(typeof ad.id).toBe('string');
      expect(typeof ad.title).toBe('string');
      expect(typeof ad.button).toBe('string');
      expect(typeof ad.bg).toBe('string');
    }
  });

  it('id 互不相同', () => {
    const ids = AD_TEMPLATES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});