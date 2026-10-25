<script setup lang="ts">
import { get, page } from '../../api/client';
import { useRacingResource } from '../../composables/useRacingResource';
import { usePage } from '../../composables/usePage';
import ResourceState from '../../components/ResourceState.vue';
import DataProvenance from '../../components/DataProvenance.vue';
const { t, route } = usePage();
const { data, loading, error, traceId, retryAfter, reload } = useRacingResource(async (options, season) => {
  if (!season) return null;
  const [team, standings, entries] = await Promise.all([get('/api/v1/teams/{id}', {}, options, String(route.params.id)), page('/api/v1/standings', { seasonId: season.id, type: 'team' }, options), page('/api/v1/seasons/{id}/entries', {}, options, season.id)]);
  return { team: team.data, ranking: standings.items.find(row => row.id === team.data.id), entries: entries.items.filter(row => row.teamId === team.data.id), snapshotId: standings.snapshotId };
});
</script>
<template><RouterLink class="back-link" :to="{ path: '/stats', query: { season: route.query.season, type: 'team' } }">← {{ t('stats.teams') }}</RouterLink><ResourceState :loading="loading" :error="error" :trace-id="traceId" :retry-after="retryAfter" :empty="!data?.content" @retry="reload"><template v-if="data?.content"><div class="page-heading"><div><p class="eyebrow">{{ t('api.database') }} / MOCK</p><h1 tabindex="-1">{{ data.content.team.name }}</h1><p class="muted">{{ data.content.team.countryCode || '—' }} · {{ data.season?.year }}</p></div></div><section class="panel" data-testid="backend-data"><h2>{{ t('stats.standings') }}</h2><dl v-if="data.content.ranking" class="metric-grid"><div><dt>{{ t('stats.position') }}</dt><dd>{{ data.content.ranking.position }}</dd></div><div><dt>{{ t('stats.points') }}</dt><dd>{{ data.content.ranking.points }}</dd></div><div><dt>{{ t('stats.wins') }}</dt><dd>{{ data.content.ranking.wins }}</dd></div></dl><p v-else>{{ t('api.noStatistics') }}</p><DataProvenance :facts="data.content.ranking" :snapshot-id="data.content.snapshotId"/></section><section><h2>{{ t('api.roster') }}</h2><div class="podium-grid"><RouterLink v-for="entry in data.content.entries" :key="entry.id" :to="{ path: '/drivers/' + entry.driverId, query: { season: data.season?.id } }" class="podium-card"><div><strong>{{ entry.driverName }}</strong><p class="caption">#{{ entry.carNumber ?? '—' }} · {{ t('api.fromRound') }} {{ entry.fromRound }} — {{ entry.toRound ?? t('api.openEnded') }}</p></div><span aria-hidden="true">↗</span></RouterLink></div><p v-if="!data.content.entries.length">{{ t('common.empty') }}</p></section><DataProvenance :facts="data.content.team"/></template></ResourceState></template>
