import { responseSchemas, type ApiResponses, type ApiSchemas } from '@nobi/contracts/api';
import * as validators from '@nobi/contracts/validators';
import { ApiError } from './errors';
export type { ApiSchemas };
export type PagePath = { [P in keyof ApiResponses]: ApiResponses[P] extends { items: unknown[] } ? P : never }[keyof ApiResponses];
export interface RequestOptions { signal?: AbortSignal; locale?: string }
export const isUuid = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
function validate(name: keyof typeof validators, value: unknown) {
  const checker = validators[name];
  if (!checker(value)) throw new ApiError('INVALID_RESPONSE');
}
const codes = new Set(['VALIDATION_FAILED', 'RESOURCE_NOT_FOUND', 'SOURCE_NOT_AUTHORIZED', 'SOURCE_UNAVAILABLE', 'RATE_LIMITED', 'SNAPSHOT_CHANGED', 'AUTH_REQUIRED', 'AUTH_FORBIDDEN']);
export async function get<P extends keyof ApiResponses>(path: P, query: Record<string, string | number> = {}, options: RequestOptions = {}, id?: string): Promise<ApiResponses[P]> {
  if (path.includes('{id}') && !isUuid(id)) throw new ApiError('RESOURCE_NOT_FOUND');
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  options.signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 8000);
  try {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...(path === '/api/v1/readiness' ? {} : { locale: options.locale || 'en-US' }), ...query })) params.set(key, String(value));
    const url = path.replace('{id}', encodeURIComponent(id || '')) + (params.size ? '?' + params : '');
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store', credentials: 'omit', redirect: 'error', headers: { Accept: 'application/json' } });
    const trace = response.headers.get('X-Request-ID');
    const traceId = trace && /^[A-Za-z0-9-]{1,64}$/.test(trace) ? trace : undefined;
    const contentType = response.headers.get('Content-Type') || '';
    if (!/application\/(?:problem\+)?json/i.test(contentType)) throw new ApiError('SOURCE_UNAVAILABLE', traceId);
    const reader = response.body?.getReader(); if (!reader) throw new ApiError('INVALID_RESPONSE');
    const chunks: Uint8Array[] = []; let size = 0;
    for (;;) {
      const chunk = await reader.read(); if (chunk.done) break;
      size += chunk.value.length;
      if (size > 2_000_000) { await reader.cancel(); throw new ApiError('INVALID_RESPONSE', traceId); }
      chunks.push(chunk.value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    let body: unknown;
    try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new ApiError('INVALID_RESPONSE', traceId); }
    if (!response.ok) {
      const code = body && typeof body === 'object' && 'code' in body && typeof body.code === 'string' && codes.has(body.code) ? body.code : 'SOURCE_UNAVAILABLE';
      const wait = Number(response.headers.get('Retry-After'));
      throw new ApiError(code, traceId, wait > 0 && wait <= 3600 ? wait : undefined);
    }
    validate(responseSchemas[path], body);
    // Phase 3 enables only the existing synthetic source. It cannot activate commercial data.
    const result = body as ApiResponses[P];
    if ('dataMode' in result && !['mock', 'empty'].includes(result.dataMode)) throw new ApiError('SOURCE_NOT_AUTHORIZED', traceId);
    const facts = 'items' in result ? result.items : 'data' in result ? [result.data] : [];
    if (facts.some(item => item.provenance.mode !== 'mock' || item.dataStatus !== 'synthetic')) throw new ApiError('SOURCE_NOT_AUTHORIZED', traceId);
    return result;
  } catch (error) {
    if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    if (error instanceof ApiError) throw error;
    throw new ApiError(timedOut ? 'TIMEOUT' : 'SOURCE_UNAVAILABLE');
  } finally { clearTimeout(timer); options.signal?.removeEventListener('abort', abort); }
}
export async function page<P extends PagePath>(path: P, query: Record<string, string | number> = {}, options: RequestOptions = {}, id?: string): Promise<ApiResponses[P]> {
  let first: ApiResponses[P] | undefined;
  const items: unknown[] = []; const cursors = new Set<string>(); let cursor: string | null = null;
  for (let count = 0; count < 20; count++) {
    const params: Record<string, string | number> = { limit: 100, ...query };
    if (cursor) params.cursor = cursor;
    const current: ApiResponses[P] = await get<P>(path, params, options, id);
    const baseline: ApiResponses[P] = first || current; first = baseline;
    if (current.snapshotVersion !== baseline.snapshotVersion || current.snapshotId !== baseline.snapshotId) throw new ApiError('SNAPSHOT_CHANGED');
    items.push(...current.items);
    if (!current.nextCursor) return { ...first, items } as ApiResponses[P];
    if (cursors.has(current.nextCursor)) throw new ApiError('INVALID_RESPONSE');
    cursors.add(current.nextCursor); cursor = current.nextCursor;
  }
  throw new ApiError('RESULT_LIMIT_EXCEEDED');
}
