import { LatestNewsResponse } from '@nobi/contracts/validators';
import type { ApiSchemas } from '@nobi/contracts/api';
import { metadataJson } from './official-news';
export type LatestNews = ApiSchemas['LatestNewsResponse'];
import {isNewsUrl,isPublicNewsUrl} from '../lib/news-links';
export {isNewsUrl} from '../lib/news-links';
export function validateLatestNews(value: unknown): LatestNews {
  if (!LatestNewsResponse(value)) throw new Error('Invalid news schema');
  const data = value as LatestNews;
  const publicNews=data.usage==='public-open-data';
  if(publicNews?(data.sourceName!=='NOBI Racing'||data.sourceUrl!=='https://github.com/f1db/f1db'||data.termsUrl!=='https://creativecommons.org/licenses/by/4.0/'):(data.sourceName!=='BBC Sport'||data.sourceUrl!=='https://www.bbc.co.uk/sport/formula1'||data.termsUrl!=='https://www.bbc.co.uk/usingthebbc/terms-of-use/#15metadataandrssfeeds'))throw new Error('Invalid news source');
  if (data.status === 'ready') {
    if (!data.syncedAt || !data.expiresAt || !data.checkedAt || Date.parse(data.expiresAt) <= Date.now() || Date.parse(data.syncedAt) > Date.now() + 300000 || Date.parse(data.expiresAt) - Date.parse(data.syncedAt) !== (publicNews?21600000:900000)) throw new Error('Invalid news freshness');
  } else if (data.items.length || data.syncedAt !== null || data.expiresAt !== null || data.sourceUpdatedAt !== null || data.newestPublishedAt !== null) throw new Error('Unavailable news');
  const seen = new Set<string>();
  const dates: string[] = [];
  for (const item of data.items) {
    for (const text of [item.summary,item.titleZh,item.summaryZh]) if (text!==null&&(/[<>]/.test(text)||[...text].some(char=>char.charCodeAt(0)<32))) throw new Error('Unsafe news content');
    if(['machine','edited','original'].includes(item.translationStatus)&&(!item.titleZh||item.summaryZh===null||!/[\u3400-\u9fff]/.test(item.titleZh))||item.translationStatus==='unavailable'&&(item.titleZh!==null||item.summaryZh!==null)||!publicNews&&item.translationStatus==='original') throw new Error('Invalid translation state');
    if(publicNews!==isPublicNewsUrl(item.url))throw new Error('Wrong article source');
    if (!item.title.trim() || /[<>]/.test(item.title) || [...item.title].some(char => char.charCodeAt(0) < 32) || !isNewsUrl(item.url) || seen.has(item.url) || item.publishedAt && Date.parse(item.publishedAt) > Date.now() + 300000) throw new Error('Invalid headline');
    seen.add(item.url); if (item.publishedAt) dates.push(item.publishedAt);
  }
  const newest = dates.sort((a,b) => Date.parse(b) - Date.parse(a))[0] || null;
  if (data.newestPublishedAt !== newest) throw new Error('Incorrect newest date');
  return data;
}
export async function latestNews(signal: AbortSignal) { return validateLatestNews(await metadataJson('/api/v1/latest-news', signal)); }
