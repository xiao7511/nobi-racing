<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { ApiSchemas } from '../api/client';
defineProps<{ seasons: ApiSchemas['Season'][]; selected?: string }>();
const route = useRoute(); const router = useRouter(); const { t } = useI18n();
function change(event: Event) { void router.replace({ query: { ...route.query, season: (event.target as HTMLSelectElement).value } }); }
</script>
<template><label v-if="seasons.length" class="season-picker">{{ t('api.season') }} <select :value="selected" @change="change"><option v-for="season in seasons" :key="season.id" :value="season.id">{{ season.year }} · {{ season.seriesCode }}</option></select></label></template>
