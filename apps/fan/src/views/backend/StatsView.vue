<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { page } from '../../api/client';
import { useRacingResource } from '../../composables/useRacingResource';
import { usePage } from '../../composables/usePage';
import ResourceState from '../../components/ResourceState.vue';
import SeasonPicker from '../../components/SeasonPicker.vue';
import DataProvenance from '../../components/DataProvenance.vue';
const { t, route } = usePage(); const router = useRouter();
const tab = computed(() => route.query.type === 'team' ? 'team' : 'driver');
const { data, loading, error, traceId, retryAfter, reload } = useRacingResource(async (options, season) => season ? page('/api/v1/standings', { seasonId: season.id, type: tab.value }, options) : null, [() => tab.value]);
function select(type: string) { void router.replace({ query: { ...route.query, type } }); }
</script>
<template>
  <div class="page-heading"><div><p class="eyebrow">{{ t('api.database') }}</p><h1 tabindex="-1">{{ t('stats.title') }}</h1><p class="muted">{{ t('api.statsDescription') }}</p></div></div>
  <SeasonPicker v-if="data" :seasons="data.seasons" :selected="data.season?.id"/>
  <RouterLink v-if="error === 'VALIDATION_FAILED'" class="button" :to="{ path: route.path, query: { ...route.query, season: undefined } }">{{ t('api.resetSelection') }}</RouterLink>
  <div class="filter-group" role="group" :aria-label="t('stats.standings')"><button v-for="item in ['driver','team']" :key="item" :aria-pressed="tab === item" @click="select(item)">{{ t('stats.' + (item === 'driver' ? 'drivers' : 'teams')) }}</button></div>
  <ResourceState :loading="loading" :error="error" :trace-id="traceId" :retry-after="retryAfter" :empty="!data?.content?.items.length" @retry="reload">
    <div class="table-wrap" data-testid="backend-data"><table><caption>{{ t('stats.' + (tab === 'driver' ? 'drivers' : 'teams')) }} · MOCK</caption><thead><tr><th scope="col">{{ t('stats.position') }}</th><th scope="col">{{ t('stats.' + tab) }}</th><th scope="col">{{ t('stats.wins') }}</th><th scope="col">{{ t('stats.points') }}</th></tr></thead><tbody><tr v-for="row in data?.content?.items" :key="row.id"><td class="position">{{ String(row.position).padStart(2, '0') }}</td><th scope="row"><RouterLink :to="{ path: (tab === 'driver' ? '/drivers/' : '/teams/') + row.id, query: { season: data?.season?.id } }" class="driver-link">{{ row.name }} ↗</RouterLink></th><td>{{ row.wins }}</td><td class="points">{{ row.points }}</td></tr></tbody></table></div>
    <DataProvenance :facts="data?.content?.items[0]" :snapshot-id="data?.content?.snapshotId"/>
  </ResourceState>
</template>
