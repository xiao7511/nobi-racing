import { computed, onScopeDispose, ref, shallowRef, watch, type WatchSource } from 'vue';
import { MockApiError } from '../api/mock-api';
import { ApiError } from '../api/errors';

export function useResource<T>(loader: (signal: AbortSignal) => Promise<T>, dependencies: WatchSource[] = [], config: { volatile?: boolean; refreshMs?: number } = {}) {
  const data = shallowRef<T | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const traceId = ref<string | undefined>();
  const retryAfter = ref<number | undefined>();
  let controller: AbortController | undefined;
  let ticket = 0;
  let notBefore = 0;
  function invalidate(code: string) { ticket++; controller?.abort(); data.value = null; loading.value = false; error.value = code; traceId.value = undefined; retryAfter.value = undefined; }
  async function reload() {
    if (Date.now() < notBefore) return;
    if (config.volatile && !navigator.onLine) { invalidate('OFFLINE'); return; }
    if (config.volatile && document.visibilityState === 'hidden') { invalidate('REFRESH_REQUIRED'); return; }
    const current = ++ticket;
    controller?.abort();
    controller = new AbortController();
    loading.value = true;
    error.value = null;
    data.value = null;
    traceId.value = undefined; retryAfter.value = undefined;
    try {
      const result = await loader(controller.signal);
      if (current === ticket) data.value = result;
    } catch (cause) {
      if (current === ticket && !controller.signal.aborted) {
        error.value = cause instanceof MockApiError || cause instanceof ApiError ? cause.code : 'MOCK_UNAVAILABLE';
        if (cause instanceof ApiError) { traceId.value = cause.traceId; retryAfter.value = cause.retryAfter; if (cause.code === 'RATE_LIMITED') notBefore = Date.now() + (cause.retryAfter || 0) * 1000; }
      }
    } finally { if (current === ticket) loading.value = false; }
  }
  watch(dependencies, () => { void reload(); }, { immediate: true });
  const offline = () => invalidate('OFFLINE');
  const visible = () => { if (document.visibilityState === 'hidden') invalidate('REFRESH_REQUIRED'); else void reload(); };
  const refresh = () => { if (document.visibilityState !== 'hidden' && navigator.onLine) void reload(); };
  const timer = config.volatile ? setInterval(refresh, config.refreshMs || 30000) : undefined;
  if (config.volatile) { window.addEventListener('offline', offline); window.addEventListener('online', refresh); window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', visible); }
  onScopeDispose(() => {
    ticket++; controller?.abort(); clearInterval(timer);
    if (config.volatile) { window.removeEventListener('offline', offline); window.removeEventListener('online', refresh); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', visible); }
  });
  return { data, loading, error, traceId, retryAfter, missing: computed(() => ['NOT_FOUND', 'RESOURCE_NOT_FOUND'].includes(error.value || '')), reload };
}
