<script setup lang="ts">
import { computed, ref } from 'vue';
import { mockApi } from '../api/mock-api';
import { useResource } from '../composables/useResource';
import { usePage } from '../composables/usePage';
import type { NewsCategory } from '../domain/models';
import ResourceState from '../components/ResourceState.vue';
import NewsCard from '../components/NewsCard.vue';
import OfficialNewsPanel from '../components/OfficialNewsPanel.vue';
import OpenCatalogPanel from '../components/OpenCatalogPanel.vue';
import LatestNewsPanel from '../components/LatestNewsPanel.vue';
import { dataTransport } from '../api/transport';
const { t, l, options, route } = usePage();
const category = ref<NewsCategory>('all');
const search = ref('');
const categories: NewsCategory[] = ['all', 'paddock', 'engineering', 'weekend'];
const { data, loading, error, reload } = useResource(signal => mockApi.articles(options(signal)), [() => route.query.scenario]);
const filtered = computed(() => data.value?.data.filter(article => (category.value === 'all' || article.category === category.value) && l(article.title).toLowerCase().includes(search.value.trim().toLowerCase())) || []);
</script>
<template><div class="page-heading"><div><p class="eyebrow">NOBI JOURNAL</p><h1 tabindex="-1">{{ t('news.title') }}</h1><p class="muted">{{ t(dataTransport === 'backend' ? 'open.pageDescription' : 'news.description') }}</p></div></div><LatestNewsPanel v-if="dataTransport === 'backend'"/><OpenCatalogPanel v-if="dataTransport === 'backend'"/><OfficialNewsPanel v-if="dataTransport === 'backend'"/><h2 v-if="dataTransport === 'backend'">{{ t('api.localStories') }} / MOCK</h2><div class="filter-row"><div class="filter-group" role="group" :aria-label="t('news.categories')"><button v-for="item in categories" :key="item" :aria-pressed="category === item" @click="category = item">{{ t('categories.' + item) }}</button></div><label class="search"><span class="sr-only">{{ t('news.search') }}</span><input type="search" v-model="search" :placeholder="t('news.search')" maxlength="100"/></label></div><ResourceState :loading="loading" :error="error" :empty="!filtered.length" @retry="reload"><div class="news-grid"><NewsCard v-for="article in filtered" :key="article.id" :article="article"/></div></ResourceState></template>
