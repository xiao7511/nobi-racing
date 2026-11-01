import { describe, expect, it } from 'vitest';
import { isNewsUrl, validateLatestNews, type LatestNews } from '../apps/fan/src/api/latest-news';
function sample(): LatestNews { const now=new Date().toISOString(); return { status:'ready',sourceName:'BBC Sport',sourceUrl:'https://www.bbc.co.uk/sport/formula1',termsUrl:'https://www.bbc.co.uk/usingthebbc/terms-of-use/#15metadataandrssfeeds',usage:'personal-local-only',checkedAt:now,syncedAt:now,expiresAt:new Date(Date.parse(now)+900000).toISOString(),sourceUpdatedAt:now,newestPublishedAt:now,items:[{title:'Original test headline',summary:'Source short summary',titleZh:'测试资讯标题',summaryZh:'来源简短摘要的中文机器翻译。',translationStatus:'machine',url:'https://www.bbc.co.uk/sport/formula1/articles/abc123?at_medium=RSS&at_campaign=rss',publishedAt:now}]}; }
describe('personal latest news boundary',()=>{
  it('preserves publisher headline, date and attribution URL',()=>{ const data=sample(); expect(validateLatestNews(data).items[0]).toEqual(data.items[0]); });
  it('rejects foreign, script, tracking redirects and traversal links',()=>{
    for(const url of ['javascript:alert(1)','https://www.bbc.co.uk.evil.test/sport/formula1/articles/abc123','https://user@www.bbc.co.uk/sport/formula1/articles/abc123','https://www.bbc.co.uk/sport/formula1/articles/abc123?next=x','https://www.bbc.co.uk/sport/formula1/articles/%2e%2e']) expect(isNewsUrl(url)).toBe(false);
  });
  it('rejects extra body text, duplicate headlines, fake newest times and expired snapshots',()=>{
    const body=sample(); Object.assign(body.items[0]!,{body:'not permitted'}); expect(()=>validateLatestNews(body)).toThrow();
    const duplicate=sample(); duplicate.items.push(duplicate.items[0]!); expect(()=>validateLatestNews(duplicate)).toThrow();
    const expired=sample(); expired.expiresAt='2020-01-01T00:00:00Z'; expect(()=>validateLatestNews(expired)).toThrow();
    const inaccurate=sample(); inaccurate.newestPublishedAt=null; expect(()=>validateLatestNews(inaccurate)).toThrow();
    const disabled=sample(); disabled.status='disabled'; expect(()=>validateLatestNews(disabled)).toThrow();
  });
  it('does not invent a missing publication date',()=>{ const data=sample(); data.items[0]!.publishedAt=null; data.newestPublishedAt=null; expect(validateLatestNews(data).items[0]!.publishedAt).toBeNull(); });
});
