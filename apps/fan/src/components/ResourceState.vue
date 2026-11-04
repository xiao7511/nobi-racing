<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { nextTick, watch, ref, onScopeDispose } from 'vue';
const props = defineProps<{ loading: boolean; error?: string | null; empty?: boolean; traceId?: string; retryAfter?: number; focusOnLoad?: boolean }>();
defineEmits<{ retry: [] }>();
const { t } = useI18n();
const seconds = ref(0);
let countdown: ReturnType<typeof setInterval> | undefined;
watch([() => props.error, () => props.retryAfter], () => {
  clearInterval(countdown);
  seconds.value = props.error === 'RATE_LIMITED' ? props.retryAfter || 0 : 0;
  if (seconds.value > 0) countdown = setInterval(() => { seconds.value--; if (!seconds.value) clearInterval(countdown); }, 1000);
}, { immediate: true });
onScopeDispose(() => clearInterval(countdown));
watch(() => props.loading, async loading => {
  if (!loading && props.focusOnLoad !== false) { await nextTick(); document.querySelector<HTMLElement>('main .route-stage:not(.route-page-leave-active) h1, main:not(:has(.route-stage)) h1')?.focus({ preventScroll: true }); }
});
</script>
<template>
  <div v-if="loading" class="state" role="status"><span class="skeleton" aria-hidden="true"></span>{{ t('common.loading') }}</div>
  <div v-else-if="error" class="state" role="alert"><h1 v-if="['NOT_FOUND', 'RESOURCE_NOT_FOUND'].includes(error)" tabindex="-1">{{ t('common.notFound') }}</h1><h2 v-else>{{ t('common.unavailable') }}</h2><p>{{ t('apiErrors.' + (['MOCK_UNAVAILABLE','NOT_FOUND'].includes(error) ? 'SOURCE_UNAVAILABLE' : error)) }}</p><p v-if="traceId" class="caption">{{ t('api.trace') }}: {{ traceId }}</p><p v-if="seconds">{{ t('api.retryAfter', { count: seconds }) }}</p><button v-if="!['NOT_FOUND', 'RESOURCE_NOT_FOUND'].includes(error)" :disabled="seconds > 0" @click="$emit('retry')">{{ t('common.retry') }}</button><RouterLink v-else to="/">{{ t('common.backHome') }}</RouterLink></div>
  <div v-else-if="empty" class="state" role="status"><h2>{{ t('common.empty') }}</h2><p>{{ t('common.emptyHint') }}</p></div>
  <slot v-else />
</template>
