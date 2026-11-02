<script setup lang="ts">
import TeamCarousel from '../components/TeamCarousel.vue';
import {usePage} from '../composables/usePage';
import LatestNewsPanel from '../components/LatestNewsPanel.vue';
const {t}=usePage();
</script>
<template><div class="page-heading"><div><p class="eyebrow">NOBI JOURNAL / F1DB</p><h1 tabindex="-1">{{t('news.title')}}</h1><p class="muted">{{t('publicData.newsDescription')}}</p></div></div><TeamCarousel/><LatestNewsPanel/></template>
