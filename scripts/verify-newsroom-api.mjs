import assert from 'node:assert/strict';
import {siteBase,jsonAt,checkMedia,checkReader,timestamp} from './newsroom-checks.mjs';

const base=siteBase(process.env.NOBI_NEWS_API||'https://api.nobistudio.com/racing/');
const feed=await jsonAt(base,'api/v1/newsroom'),media=checkMedia(feed.media);
assert.ok(['ready','delayed'].includes(feed.status)&&feed.items.length,'News index is '+feed.status+' or empty; wait for a successful source sync');
assert.equal(feed.checkIntervalSeconds,120);assert.ok(timestamp(feed.syncedAt)&&timestamp(feed.expiresAt)&&Date.parse(feed.expiresAt)>Date.now());
const candidates=[...new Map([...feed.items.slice(0,24),...media.photos,...media.videos].map(item=>[item.id,item])).values()];
const articles=[];let cursor=0;
await Promise.all(Array.from({length:3},async()=>{while(cursor<candidates.length){const item=candidates[cursor++];articles.push(checkReader(await jsonAt(base,'api/v1/newsroom/articles/'+item.id),item.id));}}));
const controller=new AbortController();let firstEvent=false,heartbeat=false;
try{const response=await fetch(new URL('api/v1/newsroom/events',base),{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(22000)]),redirect:'error'});assert.equal(response.status,200);assert.match(response.headers.get('content-type')||'',/text\/event-stream/);let text='';for await(const chunk of response.body){text+=new TextDecoder().decode(chunk);assert.ok(text.length<3000000,'SSE verification limit exceeded');firstEvent||=text.includes('event: newsroom');heartbeat||=text.includes(': heartbeat');if(firstEvent&&heartbeat)break;}}finally{controller.abort();}
assert.ok(firstEvent&&heartbeat,'SSE did not provide both a newsroom state and a heartbeat');
console.log(JSON.stringify({checkedAt:new Date().toISOString(),base,newsStatus:feed.status,mediaStatus:media.status,readerEndpointsVerified:articles.length,translationsPending:articles.filter(article=>article.translationStatus==='pending').length,photos:media.photos.length,videos:media.videos.length,sourceDateSemantics:true,events:{firstEvent,heartbeat}},null,2));
