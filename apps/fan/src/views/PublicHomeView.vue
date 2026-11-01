<script setup lang="ts">
import {computed} from 'vue';
import {usePage} from '../composables/usePage';
import {useResource} from '../composables/useResource';
import {seasonInsights} from '../api/season-insights';
import LatestRacePhoto from '../components/LatestRacePhoto.vue';
import LatestNewsPanel from '../components/LatestNewsPanel.vue';
import names from '../content/stats-names.json';
const {t,locale}=usePage();const stats=useResource(seasonInsights,[],{volatile:true,preserveWhileRefreshing:true});
const podium=computed(()=>stats.data.value?.status==='ready'&&Date.parse(stats.data.value.expiresAt!)>Date.now()?stats.data.value.rounds.at(-1)?.drivers.slice(0,3)||[]:[]);
const label=(name:string)=>locale.value==='zh-CN'&&Object.hasOwn(names,name)?names[name as keyof typeof names]:name;
const download=import.meta.env.VITE_ANDROID_DOWNLOAD_URL;
</script>
<template><div class="page-heading"><div><p class="eyebrow">2026 / NOBI RACING</p><h1 tabindex="-1">{{t('latest.heroTitle')}}</h1><p class="muted">{{t('publicData.heroCopy')}}</p></div><RouterLink class="button" to="/profile">{{t('profile.title')}} ↗</RouterLink></div><section class="hero"><LatestRacePhoto hero/><div class="hero-copy"><p class="eyebrow">NOBI / F1DB</p><h2>{{t('publicData.newsTitle')}}</h2><p>{{t('publicData.heroCopy')}}</p><RouterLink class="button primary" to="/news">{{t('latest.viewAll')}} ↗</RouterLink></div></section><div class="section-heading"><h2>{{t('stats.title')}}</h2><RouterLink to="/stats">{{t('world.exploreStandings')}} ↗</RouterLink></div><div v-if="podium.length" class="podium-grid"><RouterLink v-for="row in podium" :key="row.id" :to="{path:'/stats',query:{type:'driver',q:row.name}}" class="podium-card"><span class="position">P{{row.position}}</span><div><strong>{{label(row.name)}}</strong><p class="caption">{{label(row.team)}}</p></div><strong>{{row.points}}</strong></RouterLink></div><LatestNewsPanel compact/><section class="world-preferences"><div><h2>{{t('profile.title')}}</h2><p>{{t('world.description')}}</p></div><RouterLink class="button" to="/profile">{{t('world.welcome')}} ↗</RouterLink></section><p v-if="download" class="world-source"><a class="button" :href="download">Android APK ↧</a></p></template>
