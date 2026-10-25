import { defineStore } from 'pinia';
export type Section = 'home' | 'races' | 'news' | 'data' | 'profile';
export const usePreferences = defineStore('preferences', {
  state: () => ({ section: 'home' as Section }),
});
