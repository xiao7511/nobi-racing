import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { usePreferences } from '../apps/fan/src/stores/preferences';
import { parsePreferences, preferencesKey } from '../apps/fan/src/lib/preferences';
import { formatDate } from '../apps/fan/src/lib/format';
import { normalizeLocale } from '../packages/i18n/src/index';
beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()); });
describe('local preferences', () => {
  it('rejects corrupt storage, injected fields and invalid identifiers', () => {
    expect(parsePreferences('{')).toEqual({});
    expect(parsePreferences('null')).toEqual({});
    expect(parsePreferences(JSON.stringify({ locale: 'xx', theme: 'custom', timeZone: 'not/a-zone', savedArticleIds: ['mock-aero', 'mock-aero', 1, '<script>'], admin: true }))).toEqual({ savedArticleIds: ['mock-aero'], followedDriverIds: [] });
  });
  it('persists locale, appearance, timezone, saves and follows across store reloads', () => {
    const store = usePreferences();
    store.setLocale('zh-CN'); store.setTheme('light'); store.setTimeZone('America/New_York');
    store.toggleSaved('mock-aero'); store.toggleFollowed('mock-mei');
    setActivePinia(createPinia());
    const restored = usePreferences(); restored.initialize();
    expect(restored.$state).toMatchObject({ locale: 'zh-CN', theme: 'light', timeZone: 'America/New_York', savedArticleIds: ['mock-aero'], followedDriverIds: ['mock-mei'] });
    restored.toggleSaved('mock-aero'); expect(restored.savedArticleIds).toEqual([]);
    restored.clearSaved(); expect(restored.followedDriverIds).toEqual([]);
    expect(JSON.parse(localStorage.getItem(preferencesKey)!)).toMatchObject({ theme: 'light', locale: 'zh-CN' });
  });
  it('remains usable when browser storage is denied or full', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('denied'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('full'); });
    const store = usePreferences(); store.initialize(); store.setTheme('light');
    expect(store.theme).toBe('light'); expect(store.storageUnavailable).toBe(true);
  });
  it('rejects invalid timezones and caps local collections', () => {
    const store = usePreferences(); store.setTimeZone('UTC'); store.setTimeZone('invalid');
    expect(store.timeZone).toBe('UTC');
    store.toggleSaved('https://external.example'); expect(store.savedArticleIds).toEqual([]);
    for (let i = 0; i < 110; i++) store.toggleSaved(`mock-item-${i}`);
    expect(store.savedArticleIds).toHaveLength(100);
  });
  it('normalizes device locales and formats both sides of a DST transition', () => {
    expect(normalizeLocale('en-GB')).toBe('en-US'); expect(normalizeLocale('zh-Hans')).toBe('zh-CN');
    expect(formatDate('2026-03-08T06:30:00Z', 'en-US', 'America/New_York', true)).toContain('01:30');
    expect(formatDate('2026-03-08T07:30:00Z', 'en-US', 'America/New_York', true)).toContain('03:30');
    expect(formatDate('2026-11-08T18:00:00Z', 'zh-CN', 'Asia/Shanghai', true)).toContain('02:00');
  });
});
