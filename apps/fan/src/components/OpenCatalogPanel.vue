<script setup lang="ts">
import {safeHref} from '../lib/navigation-links';
import { computed, onScopeDispose, ref } from 'vue';
import { openCatalog } from '../api/open-catalog';
import { useResource } from '../composables/useResource';
import { usePage } from '../composables/usePage';
import ResourceState from './ResourceState.vue';
const { t, date, locale } = usePage();
const sourceDate = (value: string) => new Intl.DateTimeFormat(locale.value, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(value));
const { data, loading, error, retryAfter, reload } = useResource(openCatalog, [], { volatile: true });
const now = ref(Date.now());
const timer = setInterval(() => { now.value = Date.now(); }, 1000);
onScopeDispose(() => clearInterval(timer));
const fresh = computed(() => data.value?.status === 'ready' && Date.parse(data.value.expiresAt!) > now.value);
</script>
<template><section class="official-panel"><div class="section-heading"><h2>{{ t('open.title') }}</h2><a href="https://www.wikidata.org/wiki/Wikidata:Licensing" target="_blank" rel="noopener noreferrer">Wikidata · CC0 ↗</a></div><p class="muted">{{ t('open.description') }}</p><ResourceState :focus-on-load="false" :loading="loading" :error="error" :retry-after="retryAfter" @retry="reload"><template v-if="data"><p class="caption" role="status">{{ t('open.' + (fresh ? 'ready' : data.status === 'ready' ? 'pending' : data.status)) }}</p><p v-if="fresh" class="caption">{{ t('official.synced') }} {{ date(data.syncedAt!) }}</p><div v-if="fresh" class="open-catalog-grid"><article v-for="item in data.items" :key="item.id" class="official-source"><h3><a :href="safeHref(item.sourceUrl)" :target="(safeHref(item.sourceUrl))?.startsWith('#/')?undefined:'_blank'" rel="noopener noreferrer">{{ locale === 'zh-CN' && item.nameZh ? item.nameZh : item.name }} ↗</a></h3><p>{{ locale === 'zh-CN' ? item.descriptionZh || t('open.noChinese') : item.description }}</p><p class="caption">{{ t('open.sourceUpdated') }} <time :datetime="item.sourceUpdatedAt">{{ sourceDate(item.sourceUpdatedAt) }} (UTC)</time></p><p class="caption">{{ t('open.revision') }} {{ item.revision }}</p></article></div></template></ResourceState></section></template>
