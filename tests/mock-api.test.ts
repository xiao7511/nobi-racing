import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockApi } from '../apps/fan/src/api/mock-api';
afterEach(() => vi.useRealTimers());
describe('local mock transport', () => {
  it('labels every entity and envelope and protects fixtures from consumer mutations', async () => {
    for (const load of [mockApi.articles, mockApi.races, mockApi.drivers, mockApi.standings]) {
      const response = await load({ delay: 0 });
      expect(response.mode).toBe('mock');
      expect(response.data.every(item => item.id.startsWith('mock-') && item.provenance.mode === 'mock')).toBe(true);
    }
    const article = await mockApi.article('mock-aero', { delay: 0 });
    article.data.title['en-US'] = 'changed';
    expect((await mockApi.article('mock-aero', { delay: 0 })).data.title['en-US']).not.toBe('changed');
  });
  it('covers empty, service failure and missing detail responses', async () => {
    expect((await mockApi.articles({ scenario: 'empty', delay: 0 })).data).toEqual([]);
    await expect(mockApi.races({ scenario: 'error', delay: 0 })).rejects.toMatchObject({ code: 'MOCK_UNAVAILABLE' });
    await expect(mockApi.driver('mock-missing')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
  it('cancels delayed work immediately without waiting for timeout', async () => {
    vi.useFakeTimers(); const controller = new AbortController();
    const request = mockApi.races({ signal: controller.signal, delay: 5000 });
    const assertion = expect(request).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort(); await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });
});
