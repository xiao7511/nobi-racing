<script setup lang="ts">
import { computed, ref } from 'vue';
import { mockApi } from '../api/mock-api';
import { useResource } from '../composables/useResource';
import { usePage } from '../composables/usePage';
import ResourceState from '../components/ResourceState.vue';
const { t, date, options, route } = usePage();
const tab = ref('drivers');
const { data, loading, error, reload } = useResource(signal => mockApi.drivers(options(signal)), [() => route.query.scenario]);
const teams = computed(() => {
  const grouped = new Map<string, { name: string; points: number; wins: number; color: string }>();
  for (const driver of data.value?.data || []) {
    const team = grouped.get(driver.team) || { name: driver.team, points: 0, wins: 0, color: driver.color };
    team.points += Number(driver.points); team.wins += driver.wins; grouped.set(driver.team, team);
  }
  return [...grouped.values()].sort((a, b) => b.points - a.points);
});
</script>
<template><div class="page-heading"><div><p class="eyebrow">{{ t('common.season') }} / 2026</p><h1 tabindex="-1">{{ t('stats.title') }}</h1><p class="muted">{{ t('stats.description') }}</p></div></div><div class="filter-group" role="group" :aria-label="t('stats.standings')"><button v-for="item in ['drivers', 'teams']" :key="item" :aria-pressed="tab === item" @click="tab = item">{{ t('stats.' + item) }}</button></div><ResourceState :loading="loading" :error="error" :empty="!data?.data.length" @retry="reload"><div class="table-wrap"><table><caption>{{ t('stats.' + tab) }} · MOCK</caption><thead><tr><th scope="col">{{ t('stats.position') }}</th><th scope="col">{{ t('stats.' + (tab === 'drivers' ? 'driver' : 'team')) }}</th><th scope="col">{{ t('stats.wins') }}</th><th scope="col">{{ t('stats.points') }}</th></tr></thead><tbody v-if="tab === 'drivers'"><tr v-for="(driver, index) in data?.data" :key="driver.id"><td class="position">{{ String(index + 1).padStart(2, '0') }}</td><th scope="row"><RouterLink :to="`/drivers/${driver.id}`" class="driver-link"><span class="avatar small" :class="driver.color">{{ driver.initials }}</span><span>{{ driver.name }}<small>{{ driver.team }}</small></span></RouterLink></th><td>{{ driver.wins }}</td><td class="points">{{ driver.points }}</td></tr></tbody><tbody v-else><tr v-for="(team, index) in teams" :key="team.name"><td class="position">{{ String(index + 1).padStart(2, '0') }}</td><th scope="row">{{ team.name }}</th><td>{{ team.wins }}</td><td class="points">{{ team.points }}</td></tr></tbody></table></div><p class="source-note" v-if="data?.data[0]">{{ t('common.source') }} · {{ t('common.synthetic') }} / {{ t('common.updated') }} {{ date(data.data[0].provenance.fetchedAt) }}</p></ResourceState></template>
