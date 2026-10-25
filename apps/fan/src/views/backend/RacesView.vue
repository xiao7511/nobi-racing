<script setup lang="ts">
import { computed, ref } from 'vue';
import { page } from '../../api/client';
import { useRacingResource } from '../../composables/useRacingResource';
import { usePage } from '../../composables/usePage';
import ResourceState from '../../components/ResourceState.vue';
import SeasonPicker from '../../components/SeasonPicker.vue';
import DataProvenance from '../../components/DataProvenance.vue';
const { t, date, preferences, route } = usePage();
const filter = ref('all');
const state = useRacingResource(async (options, season) => season ? (await page('/api/v1/races', { seasonId: season.id }, options)).items : []);
const { data, loading, error, traceId, retryAfter, reload } = state;
const filtered = computed(() => data.value?.content.filter(race => filter.value === 'all' || race.status === filter.value) || []);
</script>
<template>
  <div class="page-heading"><div><p class="eyebrow">{{ t('api.database') }}</p><h1 tabindex="-1">{{ t('races.title') }}</h1><p class="muted">{{ t('api.racesDescription') }}</p></div><RouterLink class="timezone-tag" to="/settings">◷ {{ preferences.timeZone }}</RouterLink></div>
  <SeasonPicker v-if="data" :seasons="data.seasons" :selected="data.season?.id"/>
  <RouterLink v-if="error === 'VALIDATION_FAILED'" class="button" :to="{ path: route.path, query: { ...route.query, season: undefined } }">{{ t('api.resetSelection') }}</RouterLink>
  <div class="filter-group" role="group" :aria-label="t('races.filter')"><button v-for="item in ['all','scheduled','completed','cancelled']" :key="item" :aria-pressed="filter === item" @click="filter = item">{{ t('races.' + item) }}</button></div>
  <ResourceState :loading="loading" :error="error" :trace-id="traceId" :retry-after="retryAfter" :empty="!filtered.length" @retry="reload">
    <div class="race-list" data-testid="backend-data"><RouterLink v-for="race in filtered" :key="race.id" :to="{ path: '/races/' + race.id, query: { season: data?.season?.id || route.query.season } }" class="race-row"><div class="round"><span>{{ t('races.round') }}</span><strong>{{ race.round }}</strong></div><div class="race-name"><p class="eyebrow">{{ race.timeZone }}</p><h2>{{ race.name }}</h2><span class="caption">{{ t('api.database') }} · MOCK</span></div><div class="race-date"><span class="badge">{{ t('races.' + race.status) }}</span><strong>{{ date(race.startsAt) }}</strong><span class="caption">{{ preferences.timeZone }}</span></div><span aria-hidden="true">↗</span></RouterLink></div>
    <DataProvenance :facts="filtered[0]"/>
  </ResourceState>
</template>
