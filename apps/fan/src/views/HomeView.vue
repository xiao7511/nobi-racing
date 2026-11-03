<script setup lang="ts">
import ForumEntry from "../components/ForumEntry.vue";
import { computed } from 'vue';
import { mockApi } from '../api/mock-api';
import { useResource } from '../composables/useResource';
import { usePage } from '../composables/usePage';
import ResourceState from '../components/ResourceState.vue';
import NewsCard from '../components/NewsCard.vue';
import RacingArt from '../components/RacingArt.vue';
const { t, l, date, options, route } = usePage();
const { data, loading, error, reload } = useResource(async signal => {
  const [news, races, drivers] = await Promise.all([mockApi.articles(options(signal)), mockApi.races(options(signal)), mockApi.drivers(options(signal))]);
  return { news: news.data, races: races.data, drivers: drivers.data };
}, [() => route.query.scenario]);
const nextRace = computed(() => data.value?.races.find(race => race.status === 'upcoming'));
</script>
<template>
  <div class="page-heading"><div><p class="eyebrow">{{ t('home.eyebrow') }}</p><h1 tabindex="-1">{{ t('home.title') }}</h1><p class="muted">{{ t('home.description') }}</p></div><span class="edition-tag">{{ t('common.season') }} / 2026</span></div>
  <ResourceState :loading="loading" :error="error" :empty="!data?.news.length" @retry="reload">
    <template v-if="data">
      <section v-if="data.news[0]" class="hero"><RacingArt kind="velocity"/><div class="hero-copy"><p class="eyebrow">{{ t('home.featured') }} / MOCK</p><h2>{{ l(data.news[0].title) }}</h2><p>{{ l(data.news[0].summary) }}</p><RouterLink class="button primary" :to="`/news/${data.news[0].id}`">{{ t('home.readStory') }} <span aria-hidden="true">↗</span></RouterLink></div><span class="hero-coordinate" aria-hidden="true">N / 027 — THE NEXT CHAPTER</span></section>
      <div class="home-grid"><section><div class="section-heading"><h2>{{ t('home.latest') }}</h2><RouterLink to="/news">{{ t('common.viewAll') }} →</RouterLink></div><div class="news-grid compact"><NewsCard v-for="article in data.news.slice(1, 3)" :key="article.id" :article="article"/></div></section><section class="next-race" v-if="nextRace"><p class="eyebrow">{{ t('home.nextRace') }} <span class="mini-mock">MOCK</span></p><span class="round-number">{{ String(nextRace.round).padStart(2, '0') }}</span><h2>{{ l(nextRace.name) }}</h2><p class="muted">{{ l(nextRace.location) }}</p><div class="race-time"><span>{{ t('races.lightsOut') }}</span><strong>{{ date(nextRace.startsAt) }}</strong></div><RouterLink class="button" :to="`/races/${nextRace.id}`">{{ t('races.weekend') }} →</RouterLink></section></div>
      <section><div class="section-heading"><h2>{{ t('home.championship') }}</h2><RouterLink to="/stats">{{ t('common.viewAll') }} →</RouterLink></div><div class="podium-grid"><RouterLink v-for="(driver, index) in data.drivers.slice(0, 3)" :key="driver.id" :to="`/drivers/${driver.id}`" class="podium-card" :class="driver.color"><span class="position">0{{ index + 1 }}</span><div><strong>{{ driver.name }}</strong><p class="caption">{{ driver.team }}</p></div><strong>{{ driver.points }} <small>{{ t('stats.pointsShort') }}</small></strong></RouterLink></div></section>
    </template>
  </ResourceState>
<ForumEntry/></template>
