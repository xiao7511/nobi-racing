import { createI18n } from 'vue-i18n';
import en from './en.json';
import zhCN from './zh-CN.json';
export type Locale = 'en' | 'zh-CN';
export const locales: Locale[] = ['en', 'zh-CN'];
export function normalizeLocale(value: string): Locale {
  return value.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}
export function createNobiI18n(locale: Locale = 'en') {
  return createI18n({ legacy: false, locale, fallbackLocale: 'en', messages: { en, 'zh-CN': zhCN } });
}
