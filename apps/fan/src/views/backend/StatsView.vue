<script setup lang="ts">
import {usePage} from '../../composables/usePage';
import {publicReference} from '../../lib/urls';
import SeasonInsightsPanel from '../../components/SeasonInsightsPanel.vue';
const {t}=usePage();
</script>
<template>
  <div class="page-heading"><div><p class="eyebrow">2026 / SEASON INSIGHTS</p><h1 tabindex="-1">{{t('stats.title')}}</h1><p class="muted">{{t(publicReference?'publicData.statsDescription':'insights.description')}}</p></div><span class="timezone-tag">{{t('insights.historical')}}</span></div>
  <SeasonInsightsPanel/>
</template>
