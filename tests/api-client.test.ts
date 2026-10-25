import { afterEach, describe, expect, it, vi } from 'vitest';
import { get, page, type ApiSchemas } from '../apps/fan/src/api/client';
const id = '00000000-0000-4000-8000-000000000001';
const fact: ApiSchemas['StandingRow'] = { id, snapshotId: id, seasonId: id, afterRaceId: id, capturedAt: '2026-10-25T00:00:00Z', snapshotRevision: 1, position: 1, points: '286.125', wins: 6, name: 'Fictional driver', dataStatus: 'synthetic', updatedAt: '2026-10-25T00:00:00Z', provenance: { sourceId: id, sourceCode: 'NOBI_SYNTHETIC', mode: 'mock', fetchedAt: '2026-10-25T00:00:00Z', attribution: 'Original sample', timeZone: 'UTC' } };
const envelope = (patch = {}) => ({ items: [fact], nextCursor: null, dataMode: 'mock', snapshotVersion: 'a'.repeat(64), snapshotId: id, ...patch });
const json = (body: unknown, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
describe('generated backend client', () => {
  it('uses a same-origin read without credentials or caching and preserves decimal strings', async () => {
    const fetcher = vi.fn().mockResolvedValue(json(envelope())); vi.stubGlobal('fetch', fetcher);
    const result = await get('/api/v1/standings', { seasonId: id, type: 'driver' }, { locale: 'zh-CN' });
    expect(result.items[0]?.points).toBe('286.125');
    expect(fetcher.mock.calls[0]?.[0]).toContain('/api/v1/standings?locale=zh-CN');
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({ credentials: 'omit', cache: 'no-store', redirect: 'error' });
  });
  it('rejects schema drift, unapproved real-data modes and malformed identifiers', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(json(envelope({ items: [{ ...fact, points: 286.125 }] }))).mockResolvedValueOnce(json(envelope({ dataMode: 'licensed', items: [{ ...fact, dataStatus: 'current', provenance: { ...fact.provenance, mode: 'licensed' } }] })));
    vi.stubGlobal('fetch', fetcher);
    await expect(get('/api/v1/standings')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
    await expect(get('/api/v1/standings')).rejects.toMatchObject({ code: 'SOURCE_NOT_AUTHORIZED' });
    await expect(get('/api/v1/drivers/{id}', {}, {}, 'http://external.example/')).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('sanitizes problem details and respects Retry-After metadata', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ code: 'RATE_LIMITED', detail: 'Internal SQL must not reach the UI' }, 429, { 'Retry-After': '60', 'X-Request-ID': 'safe-reference' })));
    await expect(get('/api/v1/standings')).rejects.toMatchObject({ code: 'RATE_LIMITED', traceId: 'safe-reference', retryAfter: 60, message: 'RATE_LIMITED' });
  });
  it('discards partial pages when a snapshot changes or a cursor repeats', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(json(envelope({ nextCursor: 'cursor-1' }))).mockResolvedValueOnce(json(envelope({ snapshotVersion: 'b'.repeat(64) }))));
    await expect(page('/api/v1/standings')).rejects.toMatchObject({ code: 'SNAPSHOT_CHANGED' });
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => json(envelope({ nextCursor: 'same' }))));
    await expect(page('/api/v1/standings')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });
  it('bounds pages and response size', async () => {
    let counter = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => json(envelope({ nextCursor: 'next-' + counter++ }))));
    await expect(page('/api/v1/standings')).rejects.toMatchObject({ code: 'RESULT_LIMIT_EXCEEDED' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ oversized: 'x'.repeat(2_000_001) })));
    await expect(get('/api/v1/standings')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });
  it('times out and propagates caller cancellation without a fixture fallback', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))))));
    const request = get('/api/v1/standings');
    const timed = expect(request).rejects.toMatchObject({ code: 'TIMEOUT' });
    await vi.advanceTimersByTimeAsync(8000); await timed;
    const controller = new AbortController(); const aborted = get('/api/v1/standings', {}, { signal: controller.signal });
    const assertion = expect(aborted).rejects.toMatchObject({ name: 'AbortError' }); controller.abort(); await assertion;
  });
});
