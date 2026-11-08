import { describe, expect, it } from 'vitest';
import { validMedia, validNewsroom, type NewsMedia, type NewsMediaItem } from '../apps/fan/src/api/newsroom';

const now = () => new Date().toISOString();
const embedUrl = 'https://players.brightcove.net/6057949432001/FC1Xxg8gIw_default/index.html?videoId=1881235230803014139&autoplay=false&playsinline=true';
const item = (kind: 'photo' | 'video', overrides: Partial<NewsMediaItem> = {}): NewsMediaItem => ({
  id: (kind === 'photo' ? 'a' : 'b').repeat(24), kind,
  title: 'Official racing news', titleZh: '官方赛事新闻',
  url: 'https://www.formula1.com/en/latest/article/test', publisher: 'www.formula1.com',
  imageUrl: 'https://media.formula1.com/image/upload/test.jpg', publishedAt: kind === 'photo' ? null : now(),
  ...(kind === 'video' ? { embedUrl } : { updatedAt: now(), summary: 'Official short description.', summaryZh: '官方简短摘要。', credit: 'Official photographer' }),
  ...overrides,
});
const media = (overrides: Partial<NewsMedia> = {}): NewsMedia => ({
  status: 'ready', sourceName: 'Formula 1', sourceUrl: 'https://www.formula1.com/en/video',
  checkIntervalSeconds: 600, checkedAt: now(), syncedAt: now(), photos: [item('photo')], videos: [item('video')], error: null, ...overrides,
});

describe('live newsroom media response boundary', () => {
  it('accepts actual official media metadata without inventing a missing photo publication date', () => {
    const value = media({ videos: [item('video', { imageUrl: 'https://d2n9h2wits23hf.cloudfront.net/image/test.jpg' })] });
    expect(validMedia(value)).toBe(value);
    expect(validMedia(value).photos[0]!.publishedAt).toBeNull();
    expect(validMedia(value).photos[0]!.updatedAt).toBeTruthy();
    expect(validMedia(value).photos[0]!.summaryZh).toBe('官方简短摘要。');
    expect(validMedia(media({ photos: [item('photo', { summary: undefined, summaryZh: undefined, credit: undefined, updatedAt: undefined })] })).photos).toHaveLength(1);
  });

  it('rejects deceptive thumbnail hosts, embedded credentials and non-HTTPS media URLs', () => {
    for (const imageUrl of [
      'https://media.formula1.com.evil.example/test.jpg',
      'https://d2n9h2wits23hf.cloudfront.net.evil.example/test.jpg',
      'https://user:secret@media.formula1.com/test.jpg',
      'https://media.formula1.com:8443/test.jpg',
      'http://media.formula1.com/test.jpg',
      'javascript:alert(1)',
    ]) expect(() => validMedia(media({ photos: [item('photo', { imageUrl })] }))).toThrow();
    for (const url of ['https://www.formula1.com.evil.example/en/latest', 'https://user:secret@www.formula1.com/en/latest']) {
      expect(() => validMedia(media({ videos: [item('video', { url })] }))).toThrow();
    }
  });

  it('rejects untrusted players, nonnumeric video identifiers and arbitrary embed parameters', () => {
    for (const invalid of [
      embedUrl.replace('players.brightcove.net', 'players.brightcove.net.evil.example'),
      embedUrl.replace('https://', 'https://user:secret@'),
      embedUrl.replace('1881235230803014139', 'not-a-video-id'),
      embedUrl.replace('1881235230803014139', '123'),
      embedUrl.replace('/FC1Xxg8gIw_default/', '/unexpected-player/'),
      embedUrl + '&redirect=https://evil.example',
    ]) expect(() => validMedia(media({ videos: [item('video', { embedUrl: invalid })] }))).toThrow();
    expect(() => validMedia(media({ photos: [item('photo', { embedUrl })] }))).toThrow();
  });

  it('rejects invalid sync, publication and update timestamps plus markup in translated summaries', () => {
    for (const field of ['checkedAt', 'syncedAt'] as const) {
      expect(() => validMedia(media({ [field]: 'not-a-date' }))).toThrow();
    }
    for (const field of ['publishedAt', 'updatedAt'] as const) {
      expect(() => validMedia(media({ photos: [item('photo', { [field]: 'not-a-date' })] }))).toThrow();
    }
    expect(() => validMedia(media({ photos: [item('photo', { summaryZh: '<img src=x onerror=alert(1)>' })] }))).toThrow();
  });

  it('validates media received inside a live newsroom snapshot', () => {
    const value = { status: 'ready', source: 'GDELT Project', sourceUrl: 'https://www.gdeltproject.org/',
      termsUrl: 'https://www.gdeltproject.org/about.html#termsofuse', checkIntervalSeconds: 120, sourceCadenceMinutes: 15,
      checkedAt: now(), syncedAt: now(), datasetAt: now(), expiresAt: new Date(Date.now() + 3600000).toISOString(),
      topics: [], items: [], error: null, media: media() };
    expect(validNewsroom(value).media).toBe(value.media);
    value.media.videos[0]!.embedUrl = 'https://evil.example/player';
    expect(() => validNewsroom(value)).toThrow();
  });
});
