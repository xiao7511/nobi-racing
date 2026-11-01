<script setup lang="ts">
import {usePage} from '../../composables/usePage';
import {publicReference} from '../../lib/urls';
import WeekendCalendarPanel from '../../components/WeekendCalendarPanel.vue';
const {t,preferences}=usePage();
</script>
<template>
  <div class="page-heading"><div><p class="eyebrow">2026 / {{publicReference?'F1DB':'OPENF1'}}</p><h1 tabindex="-1">{{t('races.title')}}</h1><p class="muted">{{t('weekend.pageDescription')}}</p></div><RouterLink class="timezone-tag" to="/settings">◷ {{preferences.timeZone}}</RouterLink></div>
  <WeekendCalendarPanel/>
</template>
