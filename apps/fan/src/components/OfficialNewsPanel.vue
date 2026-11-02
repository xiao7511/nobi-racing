<script setup lang="ts">
import {safeHref} from '../lib/navigation-links';
import { computed, onScopeDispose, ref } from 'vue';
import { officialNews } from '../api/official-news';
import { useResource } from '../composables/useResource';
import { usePage } from '../composables/usePage';
import ResourceState from './ResourceState.vue';
const { t, date } = usePage();
const { data, loading, error, traceId, retryAfter, reload } = useResource(officialNews, [], { volatile: true });
const now = ref(Date.now());
const timer = setInterval(() => { now.value = Date.now(); }, 1000);
onScopeDispose(() => clearInterval(timer));
const sources = computed(() => data.value?.map(source => source.status === 'ready' && Date.parse(source.expiresAt!) <= now.value ? { ...source, status: 'pending' as const, items: [], syncedAt: null } : source));
</script>
<template><section class="official-panel" aria-labelledby="official-heading"><div class="section-heading"><div><p class="eyebrow">OFFICIAL SOURCES</p><h2 id="official-heading">{{ t('official.title') }}</h2></div><RouterLink to="/legal">{{ t('legal.title') }} ↗</RouterLink></div><p class="muted">{{ t('official.description') }}</p><div class="official-links"><a class="button" href="https://www.formula1.com/en/latest" target="_blank" rel="noopener noreferrer">www.formula1.com ↗</a><a class="button" href="https://www.fia.com/news" target="_blank" rel="noopener noreferrer">FIA ↗</a></div><ResourceState :focus-on-load="false" :loading="loading" :error="error" :trace-id="traceId" :retry-after="retryAfter" @retry="reload"><div class="official-grid"><article v-for="source in sources" :key="source.id" class="official-source"><p class="eyebrow">{{ source.name }}</p><p class="notice" role="status">{{ t('official.' + source.status) }}</p><p v-if="source.syncedAt" class="caption">{{ t('official.synced') }} {{ date(source.syncedAt) }}</p><ul v-if="source.items.length" class="official-items"><li v-for="item in source.items" :key="item.url"><a :href="safeHref(item.url)" :target="(safeHref(item.url))?.startsWith('#/')?undefined:'_blank'" rel="noopener noreferrer">{{ item.title }} ↗</a><time v-if="item.publishedAt" :datetime="item.publishedAt">{{ date(item.publishedAt) }}</time><span v-else class="caption">{{ t('official.noDate') }}</span></li></ul><p v-else-if="source.status === 'ready'" class="muted">{{ t('official.empty') }}</p></article></div></ResourceState></section></template>
