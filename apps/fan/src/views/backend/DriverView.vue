<script setup lang="ts">
import { get, page } from '../../api/client';
import { useRacingResource } from '../../composables/useRacingResource';
import { usePage } from '../../composables/usePage';
import ResourceState from '../../components/ResourceState.vue';
import DataProvenance from '../../components/DataProvenance.vue';
const { t, route, preferences } = usePage();
const { data, loading, error, traceId, retryAfter, reload } = useRacingResource(async (options, season) => {
  if (!season) return null;
  const [driver, standings] = await Promise.all([get('/api/v1/drivers/{id}', {}, options, String(route.params.id)), page('/api/v1/standings', { seasonId: season.id, type: 'driver' }, options)]);
  return { driver: driver.data, ranking: standings.items.find(row => row.id === driver.data.id), snapshotId: standings.snapshotId };
});
const initials = (name: string) => name.split(/\s+/).map(word => word[0]).slice(0, 2).join('');
</script>
<template><RouterLink class="back-link" :to="{ path: '/stats', query: { season: route.query.season } }">← {{ t('driver.back') }}</RouterLink><ResourceState :loading="loading" :error="error" :trace-id="traceId" :retry-after="retryAfter" :empty="!data?.content" @retry="reload"><template v-if="data?.content"><section class="driver-hero coral" data-testid="backend-data"><div class="avatar large">{{ initials(data.content.driver.name) }}</div><div><p class="eyebrow">{{ t('api.database') }} / MOCK</p><h1 tabindex="-1">{{ data.content.driver.name }}</h1><p>{{ data.content.driver.countryCode || '—' }} · #{{ data.content.driver.carNumber ?? '—' }}</p><button class="primary" :aria-pressed="preferences.followedDriverIds.includes(data.content.driver.id)" @click="preferences.toggleFollowed(data.content.driver.id)">{{ t(preferences.followedDriverIds.includes(data.content.driver.id) ? 'driver.following' : 'driver.follow') }}</button></div><span class="driver-number" aria-hidden="true">{{ data.content.driver.carNumber ?? '' }}</span></section><section class="panel"><h2>{{ data.season?.year }} · {{ t('driver.season') }}</h2><dl v-if="data.content.ranking" class="metric-grid"><div><dt>{{ t('stats.position') }}</dt><dd>{{ data.content.ranking.position }}</dd></div><div><dt>{{ t('stats.points') }}</dt><dd>{{ data.content.ranking.points }}</dd></div><div><dt>{{ t('stats.wins') }}</dt><dd>{{ data.content.ranking.wins }}</dd></div></dl><p v-else>{{ t('api.noStatistics') }}</p><p class="caption">{{ t('api.noCareerClaims') }}</p><DataProvenance :facts="data.content.ranking" :snapshot-id="data.content.snapshotId"/></section><section class="prose"><h2>{{ t('driver.about') }}</h2><p>{{ data.content.driver.biography || t('common.empty') }}</p><DataProvenance :facts="data.content.driver"/></section></template></ResourceState></template>
