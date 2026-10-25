import type { Locale } from '@nobi/i18n';
import type { Localized } from '../domain/models';
export function localize(value: Localized, locale: string): string { return value[locale === 'zh-CN' ? 'zh-CN' : 'en-US']; }
export function formatDate(value: string, locale: Locale, timeZone: string, includeTime = false): string {
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', ...(includeTime ? { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' as const } : {}), timeZone }).format(new Date(value));
}
export function formatNumber(value: string | number, locale: Locale): string { return new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(Number(value)); }
