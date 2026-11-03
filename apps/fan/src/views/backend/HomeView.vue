<script setup lang="ts">
import ForumEntry from "../../components/ForumEntry.vue";
import { computed } from 'vue';
import { mockApi } from '../../api/mock-api';
import { page } from '../../api/client';
import { useRacingResource } from '../../composables/useRacingResource';
import { useResource } from '../../composables/useResource';
import { usePage } from '../../composables/usePage';
import ResourceState from '../../components/ResourceState.vue';
import NewsCard from '../../components/NewsCard.vue';
import DataProvenance from '../../components/DataProvenance.vue';
import LatestRacePhoto from '../../components/LatestRacePhoto.vue';
import OfficialNewsPanel from '../../components/OfficialNewsPanel.vue';
import OpenCatalogPanel from '../../components/OpenCatalogPanel.vue';
import LatestNewsPanel from '../../components/LatestNewsPanel.vue';
const { t, date } = usePage();
const news = useResource(signal => mockApi.articles({ signal }));
const { data, loading, error, traceId, retryAfter, reload } = useRacingResource(async (options, season) => {
  if (!season) return null;
  const [races, standings] = await Promise.all([page('/api/v1/races', { seasonId: season.id }, options), page('/api/v1/standings', { seasonId: season.id, type: 'driver' }, options)]);
  return { races: races.items, standings };
});
const next = computed(() => data.value?.content?.races.find(race => race.status === 'scheduled'));
</script>
<template><div class="page-heading"><div><p class="eyebrow">{{ t('home.eyebrow') }}</p><h1 tabindex="-1">{{ t('home.title') }}</h1><p class="muted">{{ t('api.homeDescription') }}</p></div></div>
  <section class="hero"><LatestRacePhoto hero/><div class="hero-copy"><p class="eyebrow">NOBI / {{ t('latest.title') }}</p><h2>{{ t('latest.heroTitle') }}</h2><p>{{ t('latest.heroCopy') }}</p><RouterLink class="button primary" to="/news">{{ t('latest.viewAll') }} ↗</RouterLink></div></section>
  <LatestNewsPanel compact/>
  <div class="section-heading"><h2>{{ t('home.nextRace') }}</h2><RouterLink to="/races">{{ t('common.viewAll') }} →</RouterLink></div>
  <ResourceState :loading="loading" :error="error" :trace-id="traceId" :retry-after="retryAfter" :empty="!data?.content" @retry="reload"><template v-if="data?.content"><section v-if="next" class="next-race" data-testid="backend-data"><p class="eyebrow">{{ t('api.database') }} / MOCK</p><h2>{{ next.name }}</h2><p>{{ date(next.startsAt) }} · {{ next.timeZone }}</p><RouterLink class="button" :to="{ path: '/races/' + next.id, query: { season: data.season?.id } }">{{ t('races.weekend') }} →</RouterLink></section><p v-else class="empty-inline">{{ t('common.empty') }}</p><div class="section-heading"><h2>{{ t('home.championship') }}</h2><RouterLink :to="{ path: '/stats', query: { season: data.season?.id } }">{{ t('common.viewAll') }} →</RouterLink></div><div class="podium-grid"><RouterLink v-for="row in data.content.standings.items.slice(0, 3)" :key="row.id" :to="{ path: '/drivers/' + row.id, query: { season: data.season?.id } }" class="podium-card"><span class="position">{{ row.position }}</span><strong>{{ row.name }}</strong><strong>{{ row.points }} <small>{{ t('stats.pointsShort') }}</small></strong></RouterLink></div><DataProvenance :facts="data.content.standings.items[0]" :snapshot-id="data.content.standings.snapshotId"/></template></ResourceState>
  <OfficialNewsPanel/>
  <OpenCatalogPanel/>
  <section><div class="section-heading"><h2>{{ t('home.latest') }}</h2><RouterLink to="/news">{{ t('common.viewAll') }} →</RouterLink></div><p class="caption">{{ t('api.localStories') }}</p><div class="news-grid"><NewsCard v-for="article in news.data.value?.data.slice(1)" :key="article.id" :article="article"/></div></section>
<ForumEntry/></template>
