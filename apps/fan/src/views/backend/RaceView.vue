<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { get, page } from '../../api/client';
import { ApiError } from '../../api/errors';
import { useRacingResource } from '../../composables/useRacingResource';
import { useResource } from '../../composables/useResource';
import { usePage } from '../../composables/usePage';
import ResourceState from '../../components/ResourceState.vue';
import DataProvenance from '../../components/DataProvenance.vue';
import RacingArt from '../../components/RacingArt.vue';
const { t, date, route, preferences, locale } = usePage(); const router = useRouter();
const { data, loading, error, traceId, retryAfter, reload } = useRacingResource(async (options, season) => {
  if (!season) return null;
  const race = (await get('/api/v1/races/{id}', {}, options, String(route.params.id))).data;
  if (race.seasonId !== season.id) throw new ApiError('RESOURCE_NOT_FOUND');
  const [circuit, sessions] = await Promise.all([get('/api/v1/circuits/{id}', {}, options, race.circuitId), page('/api/v1/races/{id}/sessions', {}, options, race.id)]);
  return { race, circuit: circuit.data, sessions: sessions.items };
});
const zone = computed(() => route.query.time === 'track' ? data.value?.content?.race.timeZone || preferences.timeZone : preferences.timeZone);
const selected = computed(() => data.value?.content?.sessions.find(item => item.id === route.query.session) || data.value?.content?.sessions.find(item => item.kind === 'race') || data.value?.content?.sessions[0]);
const results = useResource(async signal => selected.value ? page('/api/v1/sessions/{id}/results', {}, { signal, locale: locale.value }, selected.value.id) : null, [() => selected.value?.id, () => locale.value], { volatile: true });
function time(track: boolean) { void router.replace({ query: { ...route.query, time: track ? 'track' : 'local' } }); }
function session(event: Event) { void router.replace({ query: { ...route.query, session: (event.target as HTMLSelectElement).value } }); }
</script>
<template>
  <RouterLink class="back-link" :to="{ path: '/races', query: { season: route.query.season } }">← {{ t('races.back') }}</RouterLink>
  <ResourceState :loading="loading" :error="error" :trace-id="traceId" :retry-after="retryAfter" :empty="!data?.content" @retry="reload">
    <template v-if="data?.content"><div class="page-heading"><div><p class="eyebrow">{{ t('races.round') }} {{ data.content.race.round }} / MOCK</p><h1 tabindex="-1">{{ data.content.race.name }}</h1><p class="muted">{{ t('api.database') }} · {{ data.content.race.timeZone }}</p></div><span class="badge">{{ t('races.' + data.content.race.status) }}</span></div>
    <div class="detail-grid" data-testid="backend-data"><section class="track-panel"><RacingArt kind="circuit"/><div class="card-copy"><h2>{{ data.content.circuit.name }}</h2><dl class="metric-grid"><div><dt>{{ t('races.length') }}</dt><dd>{{ data.content.circuit.lengthKm ?? '—' }} km</dd></div><div><dt>{{ t('races.laps') }}</dt><dd>{{ data.content.race.laps ?? '—' }}</dd></div><div><dt>{{ t('races.turns') }}</dt><dd>{{ data.content.circuit.turns ?? '—' }}</dd></div></dl></div></section><section class="panel schedule"><h2>{{ t('races.schedule') }}</h2><div class="filter-group" role="group" :aria-label="t('races.timeDisplay')"><button :aria-pressed="route.query.time !== 'track'" @click="time(false)">{{ t('races.yourTime') }}</button><button :aria-pressed="route.query.time === 'track'" @click="time(true)">{{ t('races.trackTime') }}</button></div><p class="caption">{{ zone }}</p><ol class="session-list"><li v-for="item in data.content.sessions" :key="item.id"><span>{{ t('sessions.' + item.kind) }} {{ item.sequence }}</span><time :datetime="item.startsAt">{{ date(item.startsAt, zone) }}</time></li></ol><p v-if="!data.content.sessions.length">{{ t('common.empty') }}</p></section></div>
    <section><div class="section-heading"><h2>{{ t('api.results') }}</h2><label v-if="data.content.sessions.length">{{ t('api.session') }} <select :value="selected?.id" @change="session"><option v-for="item in data.content.sessions" :key="item.id" :value="item.id">{{ t('sessions.' + item.kind) }} {{ item.sequence }}</option></select></label></div>
    <ResourceState :loading="results.loading.value" :error="results.error.value" :trace-id="results.traceId.value" :retry-after="results.retryAfter.value" :empty="!results.data.value?.items.length" @retry="results.reload"><div class="table-wrap" data-testid="session-results"><table><caption>{{ t('api.results') }} · MOCK</caption><thead><tr><th scope="col">{{ t('stats.position') }}</th><th scope="col">{{ t('stats.driver') }}</th><th scope="col">{{ t('api.resultStatus') }}</th><th scope="col">{{ t('stats.points') }}</th></tr></thead><tbody><tr v-for="row in results.data.value?.items" :key="row.id"><td>{{ row.position ?? '—' }}</td><th scope="row"><RouterLink :to="{ path: '/drivers/' + row.driverId, query: { season: data.season?.id } }">{{ row.driverName }} ↗ <small class="caption">{{ row.teamName }}</small></RouterLink></th><td>{{ t('api.result.' + row.resultStatus) }}</td><td class="points">{{ row.points }}</td></tr></tbody></table></div><DataProvenance :facts="results.data.value?.items[0]"/></ResourceState></section>
    <DataProvenance :facts="data.content.race"/>
    </template>
  </ResourceState>
</template>
