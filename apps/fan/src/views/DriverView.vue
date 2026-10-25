<script setup lang="ts">
import { mockApi } from '../api/mock-api';
import { useResource } from '../composables/useResource';
import { usePage } from '../composables/usePage';
import ResourceState from '../components/ResourceState.vue';
const { t, l, route, options, preferences } = usePage();
const { data, loading, error, reload } = useResource(signal => mockApi.driver(String(route.params.id), options(signal)), [() => route.params.id, () => route.query.scenario]);
</script>
<template><RouterLink class="back-link" to="/stats">← {{ t('driver.back') }}</RouterLink><ResourceState :loading="loading" :error="error" @retry="reload"><template v-if="data"><section class="driver-hero" :class="data.data.color"><div class="avatar large">{{ data.data.initials }}</div><div><p class="eyebrow">{{ data.data.team }} / MOCK</p><h1 tabindex="-1">{{ data.data.name }}</h1><p>{{ l(data.data.country) }} · #{{ data.data.number }}</p><button class="primary" :aria-pressed="preferences.followedDriverIds.includes(data.data.id)" @click="preferences.toggleFollowed(data.data.id)">{{ t(preferences.followedDriverIds.includes(data.data.id) ? 'driver.following' : 'driver.follow') }}</button></div><span class="driver-number" aria-hidden="true">{{ data.data.number }}</span></section><section class="panel"><h2>{{ t('driver.season') }}</h2><dl class="metric-grid four"><div v-for="(value, key) in { points: data.data.points, wins: data.data.wins, podiums: data.data.podiums, starts: data.data.starts }" :key="key"><dt>{{ t('stats.' + key) }}</dt><dd>{{ value }}</dd></div></dl></section><section class="prose"><h2>{{ t('driver.about') }}</h2><p>{{ l(data.data.biography) }}</p><p class="source-note">{{ t('common.source') }} · {{ t('common.synthetic') }}</p></section></template></ResourceState></template>
