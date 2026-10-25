import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { usePreferences } from '../stores/preferences';
import { formatDate, localize } from '../lib/format';
import type { Localized } from '../domain/models';
export function usePage() {
  const { t, locale } = useI18n();
  const route = useRoute();
  const preferences = usePreferences();
  return { t, locale, route, preferences, l: (value: Localized) => localize(value, locale.value),
    date: (value: string, zone = preferences.timeZone) => formatDate(value, preferences.locale, zone, true),
    options: (signal: AbortSignal) => ({ signal, scenario: typeof route.query.scenario === 'string' ? route.query.scenario : undefined }),
  };
}
