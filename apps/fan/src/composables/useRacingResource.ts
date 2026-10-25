import type { WatchSource } from 'vue';
import type { ApiSchemas, RequestOptions } from '../api/client';
import { page, isUuid } from '../api/client';
import { ApiError } from '../api/errors';
import { useResource } from './useResource';
import { usePage } from './usePage';
export function useRacingResource<T>(loader: (options: RequestOptions, season: ApiSchemas['Season'] | null) => Promise<T>, dependencies: WatchSource[] = []) {
  const { locale, route } = usePage();
  return useResource(async signal => {
    const options = { signal, locale: locale.value };
    const response = await page('/api/v1/seasons', {}, options);
    const seasons = [...response.items].sort((a, b) => b.year - a.year || a.id.localeCompare(b.id));
    const requested = route.query.season;
    if (requested !== undefined && (!isUuid(requested) || !seasons.some(season => season.id === requested))) throw new ApiError('VALIDATION_FAILED');
    const season = requested ? seasons.find(item => item.id === requested)! : seasons[0] || null;
    return { seasons, season, content: await loader(options, season) };
  }, [() => locale.value, () => route.query.season, () => route.params.id, ...dependencies], { volatile: true });
}
