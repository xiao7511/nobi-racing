<script setup lang="ts">
import {usePage} from '../../composables/usePage';
import PersonalWorld from '../../components/PersonalWorld.vue';
const {t}=usePage();
</script>
<template><div class="page-heading"><div><p class="eyebrow">{{t('profile.eyebrow')}}</p><h1 tabindex="-1">{{t('profile.title')}}</h1><p class="muted">{{t('world.description')}}</p></div><RouterLink class="button" to="/settings">{{t('settings.title')}} ↗</RouterLink></div><section class="world-preferences"><h2>{{t('nav.forum')}}</h2><RouterLink class="button primary" to="/forum">{{t('community.enter')}} ↗</RouterLink></section><section class="profile-shortcuts"><RouterLink class="button" to="/stats">{{t('nav.data')}} ↗</RouterLink><RouterLink class="button" to="/settings">{{t('settings.title')}} ↗</RouterLink><RouterLink class="button" to="/sources">{{t('titles.sources')}} ↗</RouterLink></section><PersonalWorld/></template>
