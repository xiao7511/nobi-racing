import {newsBookmarkKey} from './news-links';
export type ThemePreference = 'dark' | 'light' | 'system';
export interface SavedPreferences {
  locale: 'en-US' | 'zh-CN'; theme: ThemePreference; timeZone: string;
  savedArticleIds: string[]; followedDriverIds: string[];
  followedTeamIds:string[]; followedWeekendIds:number[]; savedNewsUrls:string[];
}
export const preferencesKey = 'nobi-racing:preferences:v1';
export const isOpenDriverId=(value:unknown):value is string=>typeof value==='string'&&/^openf1:driver:[1-9][0-9]{0,2}$/.test(value);
export const isTeamId=(value:unknown):value is string=>typeof value==='string'&&/^openf1:team:[A-Za-z0-9][A-Za-z0-9 .&'()-]{0,79}$/.test(value);
export const isWeekendId=(value:unknown):value is number=>typeof value==='number'&&Number.isSafeInteger(value)&&value>0&&value<=999999999;
export const isFollowId = (value: unknown): value is string => typeof value === 'string' && (isOpenDriverId(value)||/^mock-[a-z0-9-]{1,70}$/.test(value) || /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value));
export function isTimeZone(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 100) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: value }); return true; } catch { return false; }
}
export function parsePreferences(value: string | null): Partial<SavedPreferences> {
  if (!value||value.length>350000) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return {};
    const data = parsed as Record<string, unknown>;
    const ids = (input: unknown) => Array.isArray(input) ? [...new Set(input.filter((id): id is string => typeof id === 'string' && /^mock-[a-z0-9-]{1,70}$/.test(id)))].slice(0, 100) : [];
    return {
      ...(data.locale === 'en-US' || data.locale === 'zh-CN' ? { locale: data.locale } : {}),
      ...(data.theme === 'dark' || data.theme === 'light' || data.theme === 'system' ? { theme: data.theme } : {}),
      ...(isTimeZone(data.timeZone) ? { timeZone: data.timeZone } : {}),
      savedArticleIds: ids(data.savedArticleIds), followedDriverIds: Array.isArray(data.followedDriverIds) ? [...new Set(data.followedDriverIds.filter(isFollowId))].slice(0,100) : [],
      followedTeamIds:Array.isArray(data.followedTeamIds)?[...new Set(data.followedTeamIds.filter(isTeamId))].slice(0,100):[],
      followedWeekendIds:Array.isArray(data.followedWeekendIds)?[...new Set(data.followedWeekendIds.filter(isWeekendId))].slice(0,100):[],
      savedNewsUrls:Array.isArray(data.savedNewsUrls)?[...new Set(data.savedNewsUrls.map(newsBookmarkKey).filter((url):url is string=>url!==null))].slice(0,100):[],
    };
  } catch { return {}; }
}
