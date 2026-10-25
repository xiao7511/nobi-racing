import { computed, onScopeDispose, ref, shallowRef, watch, type WatchSource } from 'vue';
import { MockApiError } from '../api/mock-api';

export function useResource<T>(loader: (signal: AbortSignal) => Promise<T>, dependencies: WatchSource[] = []) {
  const data = shallowRef<T | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  let controller: AbortController | undefined;
  let ticket = 0;
  async function reload() {
    const current = ++ticket;
    controller?.abort();
    controller = new AbortController();
    loading.value = true;
    error.value = null;
    data.value = null;
    try {
      const result = await loader(controller.signal);
      if (current === ticket) data.value = result;
    } catch (cause) {
      if (current === ticket && !controller.signal.aborted) error.value = cause instanceof MockApiError ? cause.code : 'MOCK_UNAVAILABLE';
    } finally { if (current === ticket) loading.value = false; }
  }
  watch(dependencies, () => { void reload(); }, { immediate: true });
  onScopeDispose(() => { ticket++; controller?.abort(); });
  return { data, loading, error, missing: computed(() => error.value === 'NOT_FOUND'), reload };
}
