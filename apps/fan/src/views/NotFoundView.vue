<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
<template><div class="state"><p class="eyebrow">404 / NOBI RACING</p><h1 tabindex="-1">{{ t('common.notFound') }}</h1><p>{{ t('common.errorHint') }}</p><RouterLink class="button primary" to="/">{{ t('common.backHome') }} <span aria-hidden="true">→</span></RouterLink></div></template>
