<script setup lang="ts">
import { computed, ref } from 'vue';
import { mockApi } from '../api/mock-api';
import { useResource } from '../composables/useResource';
import { usePage } from '../composables/usePage';
import ResourceState from '../components/ResourceState.vue';
import RacingArt from '../components/RacingArt.vue';
const { t, l, date, options, route, preferences } = usePage();
const trackTime = ref(false);
const { data, loading, error, reload } = useResource(signal => mockApi.race(String(route.params.id), options(signal)), [() => route.params.id, () => route.query.scenario]);
const zone = computed(() => trackTime.value && data.value ? data.value.data.timeZone : preferences.timeZone);
</script>
<template><RouterLink class="back-link" to="/races">← {{ t('races.back') }}</RouterLink><ResourceState :loading="loading" :error="error" @retry="reload"><template v-if="data"><div class="page-heading"><div><p class="eyebrow">{{ t('races.round') }} {{ data.data.round }} / MOCK</p><h1 tabindex="-1">{{ l(data.data.name) }}</h1><p class="muted">{{ l(data.data.location) }}</p></div><span class="badge">{{ t('races.' + data.data.status) }}</span></div><div class="detail-grid"><section class="track-panel"><RacingArt kind="circuit"/><div class="card-copy"><h2>{{ l(data.data.circuit) }}</h2><p class="muted">{{ l(data.data.description) }}</p><dl class="metric-grid"><div><dt>{{ t('races.length') }}</dt><dd>{{ data.data.lengthKm }} km</dd></div><div><dt>{{ t('races.laps') }}</dt><dd>{{ data.data.laps }}</dd></div><div><dt>{{ t('races.turns') }}</dt><dd>{{ data.data.turns }}</dd></div></dl></div></section><section class="panel schedule"><h2>{{ t('races.schedule') }}</h2><div class="filter-group" role="group" :aria-label="t('races.timeDisplay')"><button :aria-pressed="!trackTime" @click="trackTime = false">{{ t('races.yourTime') }}</button><button :aria-pressed="trackTime" @click="trackTime = true">{{ t('races.trackTime') }}</button></div><p class="caption">{{ zone }}</p><ol class="session-list"><li v-for="session in data.data.sessions" :key="session.name"><span>{{ t('sessions.' + session.name) }}</span><time :datetime="session.startsAt">{{ date(session.startsAt, zone) }}</time></li></ol><p class="caption">{{ t('common.synthetic') }}</p></section></div></template></ResourceState></template>
