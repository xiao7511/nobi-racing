<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { nextTick, watch } from 'vue';
const props = defineProps<{ loading: boolean; error?: string | null; empty?: boolean }>();
defineEmits<{ retry: [] }>();
const { t } = useI18n();
watch(() => props.loading, async loading => {
  if (!loading) { await nextTick(); document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true }); }
});
</script>
<template>
  <div v-if="loading" class="state" role="status"><span class="skeleton" aria-hidden="true"></span>{{ t('common.loading') }}</div>
  <div v-else-if="error" class="state" role="alert"><h1 v-if="error === 'NOT_FOUND'" tabindex="-1">{{ t('common.notFound') }}</h1><h2 v-else>{{ t('common.unavailable') }}</h2><p>{{ t('common.errorHint') }}</p><button v-if="error !== 'NOT_FOUND'" @click="$emit('retry')">{{ t('common.retry') }}</button><RouterLink v-else to="/">{{ t('common.backHome') }}</RouterLink></div>
  <div v-else-if="empty" class="state" role="status"><h2>{{ t('common.empty') }}</h2><p>{{ t('common.emptyHint') }}</p></div>
  <slot v-else />
</template>
