import { ApiError } from './errors';
import {apiUrl} from '../lib/urls';
import { OfficialNewsResponse } from '@nobi/contracts/validators';
export interface OfficialItem { title: string; url: string; publishedAt: string | null }
export interface OfficialSource { id: string; name: string; homepage: string; status: 'ready' | 'pending' | 'rights_required' | 'upstream_error'; syncedAt: string | null; expiresAt: string | null; items: OfficialItem[] }
const homes: Record<string, string> = { formula1: 'https://www.formula1.com/en/latest', fia: 'https://www.fia.com/news' };
function articleUrl(value: unknown, home: string): value is string {
  if (typeof value !== 'string' || value.length > 2000) return false;
  try {
    const url = new URL(value), base = new URL(home);
    return url.origin === base.origin && url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash && url.pathname.startsWith(base.pathname + '/') && !decodeURIComponent(url.pathname).includes('..') && !decodeURIComponent(url.pathname).includes('\\');
  } catch { return false; }
}
export function validateOfficialNews(value: unknown): OfficialSource[] {
  if (!OfficialNewsResponse(value)) throw new Error('Invalid response schema');
  if (!value || typeof value !== 'object' || !('sources' in value) || !Array.isArray(value.sources) || value.sources.length !== 2) throw new Error('Invalid sources');
  const seen = new Set<string>();
  return value.sources.map((raw: unknown) => {
    if (!raw || typeof raw !== 'object') throw new Error('Invalid source');
    const source = raw as OfficialSource;
    if (!Object.hasOwn(homes, source.id) || seen.has(source.id) || source.homepage !== homes[source.id] || source.name !== (source.id === 'fia' ? 'FIA' : 'www.formula1.com') || !['ready', 'pending', 'rights_required', 'upstream_error'].includes(source.status) || !Array.isArray(source.items) || source.items.length > 20) throw new Error('Invalid source');
    seen.add(source.id);
    if (source.status === 'ready') {
      if (!source.syncedAt || !source.expiresAt || !Number.isFinite(Date.parse(source.syncedAt)) || !Number.isFinite(Date.parse(source.expiresAt)) || Date.parse(source.expiresAt) <= Date.now() || Date.parse(source.expiresAt) - Date.parse(source.syncedAt) > 900000 || Date.parse(source.expiresAt) <= Date.parse(source.syncedAt)) throw new Error('Expired news');
    } else if (source.items.length || source.syncedAt !== null || source.expiresAt !== null) throw new Error('Unlicensed news');
    for (const item of source.items) {
      if (!item || typeof item.title !== 'string' || !item.title.trim() || item.title.length > 300 || /[<>]/.test(item.title) || [...item.title].some(char => char.charCodeAt(0) < 32) || !articleUrl(item.url, source.homepage) || !(item.publishedAt === null || typeof item.publishedAt === 'string' && Number.isFinite(Date.parse(item.publishedAt)))) throw new Error('Invalid article');
    }
    return source;
  });
}
export async function metadataJson(path: '/api/v1/official-news' | '/api/v1/open-catalog' | '/api/v1/latest-news' | '/api/v1/weekends' | '/api/v1/season-insights', signal: AbortSignal): Promise<unknown> {
  const response = await fetch(apiUrl(path), { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]), credentials: 'omit', redirect: 'error', cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!response.ok) throw new ApiError(response.status === 429 ? 'RATE_LIMITED' : 'SOURCE_UNAVAILABLE', undefined, response.status === 429 ? Math.min(300, Math.max(1, Number(response.headers.get('Retry-After')) || 60)) : undefined);
  if (!response.headers.get('Content-Type')?.includes('application/json')) throw new Error('Invalid content type');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Missing body');
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) { const chunk = await reader.read(); if (chunk.done) break; size += chunk.value.length; if (size > (path==='/api/v1/season-insights'?524288:131072)) throw new Error('Response too large'); chunks.push(chunk.value); }
  } finally { await reader.cancel(); reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
export async function officialNews(signal: AbortSignal) { return validateOfficialNews(await metadataJson('/api/v1/official-news', signal)); }
