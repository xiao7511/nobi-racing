import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { useResource } from '../apps/fan/src/composables/useResource';
import { ApiError } from '../apps/fan/src/api/errors';
import { createPinia, setActivePinia } from 'pinia';
import { usePreferences } from '../apps/fan/src/stores/preferences';
beforeEach(() => { vi.useFakeTimers();vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true); });
afterEach(() => { vi.useRealTimers();vi.restoreAllMocks(); });
it('clears displayed facts on offline/hidden and rechecks on visibility/focus', async () => {
  const scope = effectScope();const loader = vi.fn().mockResolvedValue(['authorized fact']);
  const state = scope.run(() => useResource(loader, [], { volatile: true }))!;
  await flushPromises();expect(state.data.value).toEqual(['authorized fact']);
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);window.dispatchEvent(new Event('offline'));expect(state.data.value).toBeNull();
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);window.dispatchEvent(new Event('online'));await flushPromises();expect(loader).toHaveBeenCalledTimes(2);
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');document.dispatchEvent(new Event('visibilitychange'));expect(state.data.value).toBeNull();
  loader.mockResolvedValue([]);vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');document.dispatchEvent(new Event('visibilitychange'));await flushPromises();expect(state.data.value).toEqual([]);
  scope.stop();expect(vi.getTimerCount()).toBe(0);
});
it('revalidates at a bounded interval and honors the server cooldown', async () => {
  const scope = effectScope();const loader = vi.fn().mockRejectedValueOnce(new ApiError('RATE_LIMITED','ref',60)).mockResolvedValue(['current']);
  const state = scope.run(() => useResource(loader, [], { volatile: true }))!;await flushPromises();
  await vi.advanceTimersByTimeAsync(30000);await state.reload();expect(loader).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(30000);await flushPromises();expect(loader).toHaveBeenCalledTimes(2);expect(state.data.value).toEqual(['current']);scope.stop();
});
it('persists backend UUID follows without allowing arbitrary URLs or losing existing demo follows', () => {
  localStorage.clear();setActivePinia(createPinia());const preferences = usePreferences();
  preferences.toggleFollowed('00000000-0000-4000-8000-000000000001');preferences.toggleFollowed('mock-alex');preferences.toggleFollowed('https://external.example');
  setActivePinia(createPinia());const restored = usePreferences();restored.initialize();expect(restored.followedDriverIds).toEqual(['00000000-0000-4000-8000-000000000001','mock-alex']);
});
