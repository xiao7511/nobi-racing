<script setup lang="ts">
import {usePage} from '../../composables/usePage';
import {publicReference} from '../../lib/urls';
import F1Rules from '../../components/F1Rules.vue';
import WeekendCalendarPanel from '../../components/WeekendCalendarPanel.vue';
const {t,preferences}=usePage();
const scrollRules=()=>document.getElementById('f1-rules');
</script>
<template>
  <div class="page-heading"><div><p class="eyebrow">2026 / {{publicReference?'F1DB':'OPENF1'}}</p><h1 tabindex="-1">{{t('races.title')}}</h1><p class="muted">{{t('weekend.pageDescription')}}</p></div><RouterLink class="timezone-tag" to="/settings">◷ {{preferences.timeZone}}</RouterLink></div>
  <a class="button" href="#/races" @click.prevent="scrollRules()?.scrollIntoView({behavior:'smooth'})">{{preferences.locale==='zh-CN'?'F1 观赛规则 ↓':'F1 rules ↓'}}</a><F1Rules/><WeekendCalendarPanel/>
</template>
