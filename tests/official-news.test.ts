import { describe, expect, it } from 'vitest';
import { validateOfficialNews } from '../apps/fan/src/api/official-news';
const sources = () => ({ sources: [
  { id: 'formula1', name: 'www.formula1.com', homepage: 'https://www.formula1.com/en/latest', status: 'ready', syncedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 300000).toISOString(), items: [{ title: 'Original headline', url: 'https://www.formula1.com/en/latest/article/test', publishedAt: null }] },
  { id: 'fia', name: 'FIA', homepage: 'https://www.fia.com/news', status: 'rights_required', syncedAt: null, expiresAt: null, items: [] },
] });
describe('official headlines trust boundary', () => {
  it('accepts direct links and does not fabricate a missing publication date', () => {
    expect(validateOfficialNews(sources())[0]!.items[0]!.publishedAt).toBeNull();
  });
  it('rejects foreign links, script links, traversal and markup', () => {
    for (const url of ['javascript:alert(1)', 'https://www.formula1.com.evil.test/en/latest/a', 'https://user@www.formula1.com/en/latest/a', 'https://www.formula1.com/en/latest/%2e%2e/a', 'https://www.formula1.com/en/latest/a?next=x']) {
      const data = sources(); data.sources[0]!.items[0]!.url = url; expect(() => validateOfficialNews(data)).toThrow();
    }
    const data = sources(); data.sources[0]!.items[0]!.title = '<img src=x>'; expect(() => validateOfficialNews(data)).toThrow();
  });
  it('rejects expired, duplicate and unlicensed content', () => {
    const data = sources(); data.sources[0]!.expiresAt = new Date(Date.now() - 1).toISOString(); expect(() => validateOfficialNews(data)).toThrow();
    const revoked = sources(); revoked.sources[0]!.status = 'rights_required'; expect(() => validateOfficialNews(revoked)).toThrow();
    const duplicate = sources(); duplicate.sources[1] = duplicate.sources[0]!; expect(() => validateOfficialNews(duplicate)).toThrow();
  });
});
