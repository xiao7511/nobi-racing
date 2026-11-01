<script setup lang="ts">
import {usePage} from '../../composables/usePage';
import PersonalWorld from '../../components/PersonalWorld.vue';
const {t}=usePage();
</script>
<template><div class="page-heading"><div><p class="eyebrow">{{t('profile.eyebrow')}}</p><h1 tabindex="-1">{{t('profile.title')}}</h1><p class="muted">{{t('world.description')}}</p></div><RouterLink class="button" to="/settings">{{t('settings.title')}} ↗</RouterLink></div><PersonalWorld/></template>
