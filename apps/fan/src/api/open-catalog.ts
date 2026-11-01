import { metadataJson } from './official-news';
import { OpenCatalog as validCatalog } from '@nobi/contracts/validators';
export interface OpenEntry { id: string; name: string; nameZh: string; description: string; descriptionZh: string; sourceUrl: string; sourceUpdatedAt: string; revision: number }
export interface OpenCatalog { status: 'ready' | 'pending' | 'upstream_error' | 'disabled'; license: string; licenseUrl: string; syncedAt: string | null; expiresAt: string | null; items: OpenEntry[] }
export function validateCatalog(value: unknown): OpenCatalog {
  if (!validCatalog(value)) throw new Error('Invalid response schema');
  if (!value || typeof value !== 'object') throw new Error('Invalid catalog');
  const data = value as OpenCatalog;
  if (!['ready', 'pending', 'upstream_error', 'disabled'].includes(data.status) || data.license !== 'CC0 1.0' || data.licenseUrl !== 'https://creativecommons.org/publicdomain/zero/1.0/' || !Array.isArray(data.items)) throw new Error('Invalid catalog');
  if (data.status !== 'ready') { if (data.items.length || data.syncedAt !== null || data.expiresAt !== null) throw new Error('Unavailable data'); return data; }
  if (!data.syncedAt || !data.expiresAt || !Number.isFinite(Date.parse(data.syncedAt)) || !Number.isFinite(Date.parse(data.expiresAt)) || Date.parse(data.expiresAt) <= Date.now() || Date.parse(data.expiresAt) <= Date.parse(data.syncedAt) || Date.parse(data.expiresAt) - Date.parse(data.syncedAt) > 21600000 || data.items.length !== 3) throw new Error('Expired catalog');
  const seen = new Set<string>();
  for (const item of data.items) {
    if (!item || !['Q173365', 'Q9673', 'Q2239218'].includes(item.id) || seen.has(item.id) || item.sourceUrl !== 'https://www.wikidata.org/wiki/' + item.id || !Number.isFinite(Date.parse(item.sourceUpdatedAt)) || !Number.isSafeInteger(item.revision) || item.revision <= 0 || !item.name) throw new Error('Invalid entry');
    for (const text of [item.name, item.nameZh, item.description, item.descriptionZh]) if (typeof text !== 'string' || text.length > 500 || /[<>]/.test(text) || [...text].some(char => char.charCodeAt(0) < 32)) throw new Error('Invalid text');
    seen.add(item.id);
  }
  return data;
}
export async function openCatalog(signal: AbortSignal) { return validateCatalog(await metadataJson('/api/v1/open-catalog', signal)); }
