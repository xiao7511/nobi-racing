<script setup lang="ts">
import { computed } from 'vue';
import { page } from '../../api/client';
import { mockApi } from '../../api/mock-api';
import { useRacingResource } from '../../composables/useRacingResource';
import { useResource } from '../../composables/useResource';
import { usePage } from '../../composables/usePage';
import ResourceState from '../../components/ResourceState.vue';
import NewsCard from '../../components/NewsCard.vue';
const { t, preferences } = usePage();
const articles = useResource(signal => mockApi.articles({ signal }));
const { data, loading, error, traceId, retryAfter, reload } = useRacingResource(async (options, season) => season ? (await page('/api/v1/drivers', {}, options)).items : []);
const followed = computed(() => data.value?.content.filter(driver => preferences.followedDriverIds.includes(driver.id)) || []);
const saved = computed(() => articles.data.value?.data.filter(article => preferences.savedArticleIds.includes(article.id)) || []);
</script>
<template><div class="page-heading"><div><p class="eyebrow">{{ t('profile.eyebrow') }}</p><h1 tabindex="-1">{{ t('profile.title') }}</h1><p class="muted">{{ t('profile.local') }}</p></div><RouterLink class="button" to="/settings">{{ t('settings.title') }} ↗</RouterLink></div><section><div class="section-heading"><h2>{{ t('profile.following') }}</h2><span class="caption">{{ followed.length }}</span></div><ResourceState :loading="loading" :error="error" :trace-id="traceId" :retry-after="retryAfter" @retry="reload"><div v-if="followed.length" class="podium-grid" data-testid="backend-data"><RouterLink v-for="driver in followed" :key="driver.id" :to="{ path: '/drivers/' + driver.id, query: { season: data?.season?.id } }" class="podium-card"><strong>{{ driver.name }}</strong><span>↗</span></RouterLink></div><div v-else class="empty-inline"><p>{{ t('profile.noFollowing') }}</p><RouterLink to="/stats">{{ t('profile.exploreDrivers') }} →</RouterLink></div><p v-if="preferences.followedDriverIds.length > followed.length" class="notice">{{ t('api.unavailableFollows') }}</p></ResourceState></section><section><div class="section-heading"><h2>{{ t('profile.saved') }}</h2><span class="caption">{{ saved.length }}</span></div><div v-if="saved.length" class="news-grid"><NewsCard v-for="article in saved" :key="article.id" :article="article"/></div><div v-else class="empty-inline"><p>{{ t('profile.noSaved') }}</p><RouterLink to="/news">{{ t('profile.exploreNews') }} →</RouterLink></div></section></template>
