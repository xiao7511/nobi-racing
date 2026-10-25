<script setup lang="ts">
import { watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();
watchEffect(() => { document.documentElement.lang = locale.value; });
</script>
<template><div class="shell"><header><span class="brand">NOBI RACING · ADMIN</span><label>{{ t('common.language') }} <select v-model="locale"><option value="en">English</option><option value="zh-CN">简体中文</option></select></label></header><main><p class="eyebrow">{{ t('common.phase') }}</p><h1>{{ t('admin.title') }}</h1><p class="muted">{{ t('admin.description') }}</p><div class="panel" role="status">{{ t('admin.locked') }}</div></main></div></template>
