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
    expect(parsePreferences(JSON.stringify({ locale: 'xx', theme: 'custom', timeZone: 'not/a-zone', savedArticleIds: ['mock-aero', 'mock-aero', 1, '<script>'], admin: true }))).toEqual({ savedArticleIds: ['mock-aero'], followedDriverIds: [],followedTeamIds:[],followedWeekendIds:[],savedNewsUrls:[] });
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
  it('keeps source namespaces, canonical original links and legacy follows across reloads',()=>{
    const store=usePreferences();store.setLocale('zh-CN');store.setTheme('light');store.setTimeZone('Asia/Shanghai');
    store.toggleFollowed('openf1:driver:12');store.toggleFollowed('00000000-0000-4000-8000-000000000001');store.toggleTeam('openf1:team:Mercedes');store.toggleWeekend(1298);
    store.toggleNews('https://www.bbc.co.uk/sport/formula1/articles/abc123?at_medium=RSS&at_campaign=rss');
    setActivePinia(createPinia());const restored=usePreferences();restored.initialize();
    expect(restored.followedDriverIds).toContain('openf1:driver:12');expect(restored.followedTeamIds).toEqual(['openf1:team:Mercedes']);expect(restored.followedWeekendIds).toEqual([1298]);expect(restored.savedNewsUrls).toEqual(['https://www.bbc.co.uk/sport/formula1/articles/abc123']);
    restored.toggleNews('https://www.bbc.co.uk/sport/formula1/articles/abc123');expect(restored.savedNewsUrls).toEqual([]);
    restored.clearSaved();expect(restored.followedDriverIds).toEqual([]);expect(restored.followedTeamIds).toEqual([]);expect(restored.followedWeekendIds).toEqual([]);expect(restored.$state).toMatchObject({locale:'zh-CN',theme:'light',timeZone:'Asia/Shanghai'});
  });
  it('rejects injected links and invalid IDs without storing source content',()=>{
    const parsed=parsePreferences(JSON.stringify({followedDriverIds:['openf1:driver:12','openf1:driver:12','openf1:driver:0','openf1:driver:<script>'],followedTeamIds:['openf1:team:Mercedes','openf1:team:<img>'],followedWeekendIds:[1298,1298,'1298',-1,1.1],savedNewsUrls:['javascript:alert(1)','https://www.bbc.co.uk.evil.example/sport/formula1/articles/a','https://user@www.bbc.co.uk/sport/formula1/articles/a','https://www.bbc.co.uk/sport/formula1/articles/a?other=x','https://www.bbc.co.uk/sport/formula1/articles/abc123'],cachedHeadline:'not retained'}));
    expect(parsed.followedDriverIds).toEqual(['openf1:driver:12']);expect(parsed.followedTeamIds).toEqual(['openf1:team:Mercedes']);expect(parsed.followedWeekendIds).toEqual([1298]);expect(parsed.savedNewsUrls).toEqual(['https://www.bbc.co.uk/sport/formula1/articles/abc123']);expect(parsed).not.toHaveProperty('cachedHeadline');
    const store=usePreferences();store.toggleTeam('openf1:team:<script>');store.toggleWeekend(NaN);store.toggleNews('https://evil.example');expect(store.followedTeamIds).toEqual([]);expect(store.followedWeekendIds).toEqual([]);expect(store.savedNewsUrls).toEqual([]);
  });
  it('caps every new collection and permits removal when it is full',()=>{
    const store=usePreferences();for(let id=1;id<=101;id++){store.toggleFollowed('openf1:driver:'+id);store.toggleTeam('openf1:team:Team '+id);store.toggleWeekend(id);store.toggleNews('https://www.bbc.co.uk/sport/formula1/articles/id'+id);}
    expect(store.followedDriverIds).toHaveLength(100);expect(store.followedTeamIds).toHaveLength(100);expect(store.followedWeekendIds).toHaveLength(100);expect(store.savedNewsUrls).toHaveLength(100);expect(store.collectionLimitReached).toBe(true);
    store.toggleTeam('openf1:team:Team 1');expect(store.followedTeamIds).toHaveLength(99);expect(store.collectionLimitReached).toBe(false);store.toggleTeam('openf1:team:Team 101');expect(store.followedTeamIds).toHaveLength(100);
  });
});
