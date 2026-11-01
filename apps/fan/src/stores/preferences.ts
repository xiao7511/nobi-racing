import { defineStore } from 'pinia';
import { normalizeLocale, type Locale } from '@nobi/i18n';
import { isTimeZone, isFollowId, isTeamId, isWeekendId, parsePreferences, preferencesKey, type ThemePreference } from '../lib/preferences';
import {newsBookmarkKey} from '../lib/news-links';

export const usePreferences = defineStore('preferences', {
  state: () => ({
    locale: 'en-US' as Locale, theme: 'dark' as ThemePreference, timeZone: 'UTC',
    savedArticleIds: [] as string[], followedDriverIds: [] as string[], storageUnavailable: false,
    followedTeamIds:[] as string[], followedWeekendIds:[] as number[], savedNewsUrls:[] as string[], collectionLimitReached:false,
  }),
  actions: {
    initialize() {
      this.locale = normalizeLocale(navigator.language);
      this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      try { Object.assign(this, parsePreferences(localStorage.getItem(preferencesKey))); }
      catch { this.storageUnavailable = true; }
    },
    persist() {
      try {
        localStorage.setItem(preferencesKey, JSON.stringify({
          locale: this.locale, theme: this.theme, timeZone: this.timeZone,
          savedArticleIds: this.savedArticleIds, followedDriverIds: this.followedDriverIds,
          followedTeamIds:this.followedTeamIds,followedWeekendIds:this.followedWeekendIds,savedNewsUrls:this.savedNewsUrls,
        }));
        this.storageUnavailable = false;
      } catch { this.storageUnavailable = true; }
    },
    setLocale(value: string) { this.locale = normalizeLocale(value); this.persist(); },
    setTheme(value: ThemePreference) { this.theme = value; this.persist(); },
    setTimeZone(value: string) { if (isTimeZone(value)) { this.timeZone = value; this.persist(); } },
    toggleSaved(id: string) {
      if (!/^mock-[a-z0-9-]+$/.test(id)) return;
      this.savedArticleIds = this.savedArticleIds.includes(id) ? this.savedArticleIds.filter(value => value !== id) : [...this.savedArticleIds, id].slice(0, 100);
      this.persist();
    },
    toggleFollowed(id: string) {
      if (!isFollowId(id)) return;
      this.collectionLimitReached=false;
      if(!this.followedDriverIds.includes(id)&&this.followedDriverIds.length>=100){this.collectionLimitReached=true;return;}
      this.followedDriverIds = this.followedDriverIds.includes(id) ? this.followedDriverIds.filter(value => value !== id) : [...this.followedDriverIds, id].slice(0, 100);
      this.persist();
    },
    toggleTeam(id:string) {
      if(!isTeamId(id))return;this.collectionLimitReached=false;
      if(!this.followedTeamIds.includes(id)&&this.followedTeamIds.length>=100){this.collectionLimitReached=true;return;}
      this.followedTeamIds=this.followedTeamIds.includes(id)?this.followedTeamIds.filter(value=>value!==id):[...this.followedTeamIds,id];this.persist();
    },
    toggleWeekend(id:number) {
      if(!isWeekendId(id))return;this.collectionLimitReached=false;
      if(!this.followedWeekendIds.includes(id)&&this.followedWeekendIds.length>=100){this.collectionLimitReached=true;return;}
      this.followedWeekendIds=this.followedWeekendIds.includes(id)?this.followedWeekendIds.filter(value=>value!==id):[...this.followedWeekendIds,id];this.persist();
    },
    toggleNews(value:string) {
      const url=newsBookmarkKey(value);if(!url)return;this.collectionLimitReached=false;
      if(!this.savedNewsUrls.includes(url)&&this.savedNewsUrls.length>=100){this.collectionLimitReached=true;return;}
      this.savedNewsUrls=this.savedNewsUrls.includes(url)?this.savedNewsUrls.filter(item=>item!==url):[...this.savedNewsUrls,url];this.persist();
    },
    clearSaved() { this.savedArticleIds = []; this.followedDriverIds = []; this.followedTeamIds=[];this.followedWeekendIds=[];this.savedNewsUrls=[];this.collectionLimitReached=false;this.persist(); },
  },
});
