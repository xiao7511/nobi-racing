import { describe, expect, it } from 'vitest';
import { validateCatalog } from '../apps/fan/src/api/open-catalog';
const sample = () => ({ status: 'ready', license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', syncedAt: new Date().toISOString(), expiresAt: new Date(Date.now()+60000).toISOString(), items: ['Q173365','Q9673','Q2239218'].map(id => ({ id, name: 'Open label', nameZh: '', description: 'Open metadata', descriptionZh: '', sourceUrl: 'https://www.wikidata.org/wiki/'+id, sourceUpdatedAt: '2026-01-01T00:00:00Z', revision: 1 })) });
describe('CC0 catalog boundary', () => {
  it('accepts licensed metadata with revision and source', () => { expect(validateCatalog(sample()).items).toHaveLength(3); });
  it('rejects wrong source, missing revision, markup and expired data', () => {
    for (const patch of [{ sourceUrl: 'https://evil.test' }, { revision: -1 }, { name: '<script>' }]) { const data=sample(); Object.assign(data.items[0]!,patch); expect(()=>validateCatalog(data)).toThrow(); }
    const data=sample(); data.expiresAt='2020-01-01T00:00:00Z'; expect(()=>validateCatalog(data)).toThrow();
  });
  it('rejects facts attached to an unavailable source', () => { const data=sample(); data.status='upstream_error'; expect(()=>validateCatalog(data)).toThrow(); });
});
