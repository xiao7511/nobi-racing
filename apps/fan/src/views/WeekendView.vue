<script setup lang="ts">
import {computed} from 'vue';
import {usePage} from '../composables/usePage';
import WeekendCalendarPanel from '../components/WeekendCalendarPanel.vue';
const {route,t}=usePage();
const id=computed(()=>/^[1-9][0-9]{0,8}$/.test(String(route.params.id))?Number(route.params.id):null);
</script>
<template><RouterLink class="back-link" to="/races">← {{t('races.back')}}</RouterLink><div class="page-heading"><h1 tabindex="-1">{{t('weekend.detail')}}</h1></div><WeekendCalendarPanel v-if="id" :meeting-id="id"/><p v-else class="notice" role="status">{{t('weekend.notFound')}}</p></template>
