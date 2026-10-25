<script setup lang="ts">
import type { Article } from '../domain/models';
import { usePage } from '../composables/usePage';
import RacingArt from './RacingArt.vue';
defineProps<{ article: Article }>();
const { t, l, date } = usePage();
</script>
<template><article class="news-card"><RouterLink :to="`/news/${article.id}`"><RacingArt :kind="article.art"/><div class="card-copy"><p class="eyebrow">{{ t('categories.' + article.category) }} <span class="mini-mock">MOCK</span></p><h3>{{ l(article.title) }}</h3><p class="muted">{{ l(article.summary) }}</p><p class="caption">{{ date(article.publishedAt) }} · {{ t('news.minutes', { count: article.readMinutes }) }} <span class="arrow">↗</span></p></div></RouterLink></article></template>
