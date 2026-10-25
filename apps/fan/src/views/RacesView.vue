<script setup lang="ts">
import { computed, ref } from 'vue';
import { mockApi } from '../api/mock-api';
import { useResource } from '../composables/useResource';
import { usePage } from '../composables/usePage';
import ResourceState from '../components/ResourceState.vue';
const { t, l, date, options, route, preferences } = usePage();
const filter = ref('all');
const { data, loading, error, reload } = useResource(signal => mockApi.races(options(signal)), [() => route.query.scenario]);
const filtered = computed(() => data.value?.data.filter(race => filter.value === 'all' || race.status === filter.value) || []);
</script>
<template><div class="page-heading"><div><p class="eyebrow">{{ t('common.season') }} / 2026</p><h1 tabindex="-1">{{ t('races.title') }}</h1><p class="muted">{{ t('races.description') }}</p></div><RouterLink class="timezone-tag" to="/settings">◷ {{ preferences.timeZone }}</RouterLink></div><div class="filter-group" role="group" :aria-label="t('races.filter')"><button v-for="item in ['all', 'upcoming', 'completed']" :key="item" :aria-pressed="filter === item" @click="filter = item">{{ t('races.' + item) }}</button></div><ResourceState :loading="loading" :error="error" :empty="!filtered.length" @retry="reload"><div class="race-list"><RouterLink v-for="race in filtered" :key="race.id" :to="`/races/${race.id}`" class="race-row"><div class="round"><span>{{ t('races.round') }}</span><strong>{{ race.round }}</strong></div><div class="race-name"><p class="eyebrow">{{ l(race.location) }}</p><h2>{{ l(race.name) }}</h2><span class="caption">{{ l(race.circuit) }}</span></div><div class="race-date"><span class="badge">{{ t('races.' + race.status) }} · MOCK</span><strong>{{ date(race.startsAt) }}</strong><span class="caption">{{ preferences.timeZone }}</span></div><span aria-hidden="true">↗</span></RouterLink></div></ResourceState></template>
