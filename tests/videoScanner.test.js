import { describe, it, expect } from 'vitest';
import path from 'node:path';
import scanner from '../src/core/videoScanner.js';

const { isVideoFile, filterVideos, scanFolder } = scanner;

describe('isVideoFile', () => {
  it('识别 mp4/webm/ogv/m4v(大小写不敏感)', () => {
    expect(isVideoFile('a.mp4')).toBe(true);
    expect(isVideoFile('B.WEBM')).toBe(true);
    expect(isVideoFile('c.ogv')).toBe(true);
    expect(isVideoFile('d.m4v')).toBe(true);
  });
  it('拒绝非视频与不支持的容器', () => {
    expect(isVideoFile('e.txt')).toBe(false);
    expect(isVideoFile('f.mkv')).toBe(false);
    expect(isVideoFile('noext')).toBe(false);
  });
});

describe('filterVideos', () => {
  it('只留视频文件', () => {
    expect(filterVideos(['a.mp4', 'b.txt', 'c.webm'])).toEqual(['a.mp4', 'c.webm']);
  });
});

describe('scanFolder', () => {
  it('注入 readdir,返回 {name,path}', () => {
    const fakeReaddir = () => ['x.mp4', 'y.jpg', 'z.webm'];
    const result = scanFolder('/videos', fakeReaddir);
    expect(result).toEqual([
      { name: 'x.mp4', path: path.join('/videos', 'x.mp4') },
      { name: 'z.webm', path: path.join('/videos', 'z.webm') },
    ]);
  });
});