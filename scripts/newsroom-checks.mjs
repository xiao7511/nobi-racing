import assert from 'node:assert/strict';

export const chinese=value=>typeof value==='string'&&/[\u3400-\u9fff]/.test(value);
export const timestamp=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
export function siteBase(value){const url=new URL(value);assert.ok(['http:','https:'].includes(url.protocol)&&!url.username&&!url.password&&!url.search&&!url.hash,'Use an HTTP(S) site root without credentials, query or fragment');url.pathname=url.pathname.replace(/\/?$/,'/');return url.href;}
export async function jsonAt(base,path){const response=await fetch(new URL(path,base),{signal:AbortSignal.timeout(30000),cache:'no-store',redirect:'error'});assert.equal(response.status,200,path);const text=await response.text();assert.ok(text.length<=2000000,'Response exceeds verification limit: '+path);return JSON.parse(text);}
export function officialPlayer(value){const url=new URL(value);assert.equal(url.origin,'https://players.brightcove.net');assert.ok(!url.username&&!url.password&&!url.hash);assert.equal(url.pathname,'/6057949432001/FC1Xxg8gIw_default/index.html');assert.match(url.searchParams.get('videoId')||'',/^\d{10,24}$/);assert.ok([...url.searchParams.keys()].every(key=>['videoId','autoplay','playsinline'].includes(key)));return url.href;}
export function checkMedia(media){
 assert.ok(media,'Official media feed is missing; deploy the current service first');
 assert.ok(['ready','delayed'].includes(media.status),'Official media source is '+media.status+'; wait for a real synchronization before verifying');
 assert.equal(media.sourceName,'Formula 1');assert.equal(media.sourceUrl,'https://www.formula1.com/en/video');assert.equal(media.checkIntervalSeconds,600);
 assert.ok(timestamp(media.checkedAt)&&timestamp(media.syncedAt),'Missing successful media sync time');assert.ok(Date.parse(media.syncedAt)<=Date.parse(media.checkedAt)+300000,'Sync time exceeds source check');
 for(const kind of ['photo','video']){const items=kind==='photo'?media.photos:media.videos;assert.ok(Array.isArray(items)&&items.length>0&&items.length<=30,'No current '+kind+' news from the source');
  for(const item of items){assert.equal(item.kind,kind);assert.match(item.id,/^[a-f0-9]{24}$/);const source=new URL(item.url);assert.equal(source.origin,'https://www.formula1.com');assert.ok(!source.username&&!source.password);if(item.imageUrl){const image=new URL(item.imageUrl);assert.equal(image.protocol,'https:');assert.ok(['media.formula1.com','d2n9h2wits23hf.cloudfront.net'].includes(image.hostname)&&!image.username&&!image.password&&!image.port);}
   assert.ok(item.publishedAt===null||timestamp(item.publishedAt),'Invalid publication date');assert.ok(item.updatedAt==null||timestamp(item.updatedAt),'Invalid source update date');const at=item.publishedAt||item.updatedAt;assert.ok(timestamp(at),'No actual source date');assert.ok(Date.parse(at)<=Date.now()+300000&&Date.now()-Date.parse(at)<=7*86400000,'Media is future-dated or older than the live window');if(kind==='video')officialPlayer(item.embedUrl);
  }
 }
 return media;
}
export function checkReader(article,id){assert.equal(article.id,id);assert.ok(chinese(article.titleZh),'Reader title fell back to a foreign headline');assert.ok(Array.isArray(article.paragraphsZh)&&article.paragraphsZh.length>0&&article.paragraphsZh.every(chinese),'Missing Chinese reader content');assert.ok(Array.isArray(article.paragraphsEn)&&article.paragraphsEn.length>0);if(article.translationStatus)assert.ok(['ready','pending','unavailable'].includes(article.translationStatus));return article;}
