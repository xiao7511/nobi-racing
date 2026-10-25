import { createI18n } from 'vue-i18n';
import en from './en.json';
import zhCN from './zh-CN.json';
export type Locale = 'en-US' | 'zh-CN';
export const locales: Locale[] = ['en-US', 'zh-CN'];
export function normalizeLocale(value: string): Locale {
  return value.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';
}
export function createNobiI18n(locale: Locale = 'en-US') {
  return createI18n({ legacy: false, locale, fallbackLocale: 'en-US', messages: { 'en-US': en, 'zh-CN': zhCN } });
}
