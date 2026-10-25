import { defineStore } from 'pinia';
import { normalizeLocale, type Locale } from '@nobi/i18n';
import { isTimeZone, parsePreferences, preferencesKey, type ThemePreference } from '../lib/preferences';

export const usePreferences = defineStore('preferences', {
  state: () => ({
    locale: 'en-US' as Locale, theme: 'dark' as ThemePreference, timeZone: 'UTC',
    savedArticleIds: [] as string[], followedDriverIds: [] as string[], storageUnavailable: false,
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
      if (!/^mock-[a-z0-9-]+$/.test(id)) return;
      this.followedDriverIds = this.followedDriverIds.includes(id) ? this.followedDriverIds.filter(value => value !== id) : [...this.followedDriverIds, id].slice(0, 100);
      this.persist();
    },
    clearSaved() { this.savedArticleIds = []; this.followedDriverIds = []; this.persist(); },
  },
});
