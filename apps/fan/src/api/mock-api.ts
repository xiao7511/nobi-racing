import { articles, drivers, races, standings } from './fixtures';
import type { ApiEnvelope } from '../domain/models';
export class MockApiError extends Error {
  constructor(public code: 'NOT_FOUND' | 'MOCK_UNAVAILABLE') { super(code); }
}
export interface MockOptions { signal?: AbortSignal; scenario?: string; delay?: number }
async function respond<T>(data: T, options: MockOptions = {}): Promise<ApiEnvelope<T>> {
  await new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); };
    const timer = setTimeout(() => { options.signal?.removeEventListener('abort', abort); resolve(); }, options.delay ?? 160);
    if (options.signal?.aborted) abort();
    else options.signal?.addEventListener('abort', abort, { once: true });
  });
  if (options.scenario === 'error') throw new MockApiError('MOCK_UNAVAILABLE');
  return { data: structuredClone(options.scenario === 'empty' && Array.isArray(data) ? [] as T : data), mode: 'mock', generatedAt: '2026-10-25T00:00:00Z' };
}
function detail<T extends { id: string }>(items: T[], id: string, options?: MockOptions) {
  const value = items.find(item => item.id === id);
  if (!value) return Promise.reject(new MockApiError('NOT_FOUND'));
  return respond(value, options);
}
// Local asynchronous transport only. No external URL, credential or production fallback.
export const mockApi = {
  articles: (options?: MockOptions) => respond(articles, options),
  article: (id: string, options?: MockOptions) => detail(articles, id, options),
  races: (options?: MockOptions) => respond(races, options),
  race: (id: string, options?: MockOptions) => detail(races, id, options),
  drivers: (options?: MockOptions) => respond(drivers, options),
  driver: (id: string, options?: MockOptions) => detail(drivers, id, options),
  standings: (options?: MockOptions) => respond(standings, options),
};
