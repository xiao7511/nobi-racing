<script setup lang="ts">
import { mockApi } from '../api/mock-api';
import { useResource } from '../composables/useResource';
import { usePage } from '../composables/usePage';
import ResourceState from '../components/ResourceState.vue';
import RacingArt from '../components/RacingArt.vue';
const { t, l, date, route, options, preferences } = usePage();
const { data, loading, error, reload } = useResource(signal => mockApi.article(String(route.params.id), options(signal)), [() => route.params.id, () => route.query.scenario]);
</script>
<template><RouterLink class="back-link" to="/news">← {{ t('news.back') }}</RouterLink><ResourceState :loading="loading" :error="error" @retry="reload"><article v-if="data" class="article-detail"><p class="eyebrow">{{ t('categories.' + data.data.category) }} / MOCK</p><h1 tabindex="-1">{{ l(data.data.title) }}</h1><p class="standfirst">{{ l(data.data.summary) }}</p><div class="article-meta"><span>{{ l(data.data.author) }} · {{ date(data.data.publishedAt) }} · {{ t('news.minutes', { count: data.data.readMinutes }) }}</span><button :aria-pressed="preferences.savedArticleIds.includes(data.data.id)" @click="preferences.toggleSaved(data.data.id)">{{ t(preferences.savedArticleIds.includes(data.data.id) ? 'news.saved' : 'news.save') }}</button></div><RacingArt :kind="data.data.art"/><div class="prose"><p v-for="(paragraph, index) in data.data.paragraphs" :key="index">{{ l(paragraph) }}</p><aside class="source-note">{{ t('common.source') }} · {{ t('common.synthetic') }}<br/>{{ t('common.updated') }} · {{ date(data.data.provenance.fetchedAt) }}</aside></div></article></ResourceState></template>
