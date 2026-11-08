import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const briefs=JSON.parse(readFileSync(new URL('./newsroom-briefs.json',import.meta.url),'utf8'));
export const hasReviewedBody=url=>briefs.some(b=>b.urls.includes(url));
const identify=url=>'nobi-'+createHash('sha256').update(url).digest('hex').slice(0,24);
const translated=(value,names)=>names[value]||value;
function context(data,meeting,names){
 const round=data?.rounds?.find(r=>r.meetingId===meeting?.id);if(!round)return [];
 return [
  {headingZh:'本站资料：该站赛后车手积分前五',headingEn:'NOBI reference: leading five drivers after this round',rows:round.drivers.slice(0,5).map(d=>({zh:`第 ${d.position} · ${translated(d.name,names)} · ${translated(d.team,names)} · ${d.points} 分`,en:`P${d.position} · ${d.name} · ${d.team} · ${d.points} points`}))},
  {headingZh:'本站资料：该站赛后车队积分前三',headingEn:'NOBI reference: leading three constructors after this round',rows:round.teams.slice(0,3).map(t=>({zh:`第 ${t.position} · ${translated(t.name,names)} · ${t.points} 分`,en:`P${t.position} · ${t.name} · ${t.points} points`}))}
 ];
}
export function originalArticles(data,names={}){
 return (data?.news||[]).slice(0,10).map(n=>{
  const meeting=data.weekends.find(m=>n.title.startsWith(m.name));const race=n.url.endsWith('/race-results.yml');
  return {id:identify(n.url),kind:'original',title:n.title,titleZh:n.titleZh,publishedAt:n.publishedAt,indexedAt:null,sourceName:'F1DB / Marcel Overdijk',sourceUrl:n.url,licenseUrl:'https://creativecommons.org/licenses/by/4.0/',author:'NOBI Racing',
   paragraphsZh:[n.summaryZh,`${meeting?.nameZh||'本场比赛'}的${race?'正赛':'排位赛'}分类已收录于公开赛果。本文由本站根据结构化数据生成，中文与英文内容同步展示同一组事实；赛果如有修订，将随数据源更新。`, '以下积分属于这一分站正赛结束后的赛季累计积分，不是本站推测的比赛过程。排位赛报道中仅在已有该站正赛赛后积分时展示此资料。'],
   paragraphsEn:[n.summary,`This ${race?'race':'qualifying'} classification is included in the open results. NOBI generated this report from structured data. The Chinese and English versions present the same facts and are refreshed when source data changes.`, 'The standings below are season totals after this round’s race, not an inferred account of the action. In a qualifying report this reference appears only if the subsequent race standings are already available.'],
   sections:context(data,meeting,names),noticeZh:'本站原创双语战报，非第三方新闻原文译载。数据与改编署名：F1DB / Marcel Overdijk、NOBI Racing，CC BY 4.0。',noticeEn:'Original NOBI bilingual report, not a translation of a third-party article. Data and adaptation: F1DB / Marcel Overdijk and NOBI Racing, CC BY 4.0.'};
 });
}
export function indexedArticle(item,feed,data,names={}){
 if(item?.openBrief)return {id:item.id,kind:'original',...item.openBrief,publishedAt:null,indexedAt:item.indexedAt,reviewedDate:item.indexedAt.slice(0,10),author:'NOBI Racing',sections:[],backgroundSource:'When’s the Race / F1DB · CC BY 4.0; sportstimes/f1 · MIT'};
 const brief=item&&briefs.find(b=>b.urls.includes(item.url));
 if(brief)return reviewedBrief(brief,item.id,item,data,names);
 if(!item)return null;const matched=feed.topics.filter(t=>item.topics.includes(t.id));const race=matched.find(t=>t.kind==='race');const meeting=data?.weekends?.find(m=>m.name===race?.name);const namesZh=matched.map(t=>t.nameZh).join('、'),namesEn=matched.map(t=>t.name).join(', ');
 return {id:item.id,kind:'index-note',detailStatus:'index-only',translationStatus:item.titleZh?'ready':'pending',title:item.titleEn||item.language==='en'&&item.title||`F1 update${namesEn?': '+namesEn:''}`,titleZh:item.titleZh||'F1 新闻：中文译文准备中',publishedAt:item.publishedAt||null,sourceUpdatedAt:item.sourceUpdatedAt||null,indexedAt:item.indexedAt,sourceName:item.publisher,sourceUrl:item.url,author:'NOBI Racing',licenseUrl:null,
  paragraphsZh:[`公开新闻索引收录了 ${item.publisher} 的一则报道${namesZh?'，涉及'+namesZh:''}。${item.titleZh?'可核对的中文标题为：“'+item.titleZh+'”。':'中文标题正在准备，稍后重试即可重新请求翻译。'}`, '目前该来源未提供本站可以公开翻译、转载的完整正文。这里仅展示索引信息和本站独立整理的资料，不补写未取得的原文内容。'],
  paragraphsEn:[`The public news index lists a report from ${item.publisher}${namesEn?' concerning '+namesEn:''}. Its indexed headline is available below.`, 'This publisher has not supplied a full article that NOBI may publicly translate and republish. This page contains index information and independently compiled reference data; it does not invent missing article text.'],
  originalTitle:item.title,sections:context(data,meeting,names),noticeZh:'新闻索引来自 GDELT Project；本页是站内索引说明，不是原文全文或全文翻译。来源链接仅供自愿核对。',noticeEn:'News index: GDELT Project. This is an index note, not the full original article or a full translation. The source link is optional.'};
}
function reviewedBrief(brief,id,item,data,names,fallbackDate=null){
 const meeting=data?.weekends?.find(m=>m.circuit==='Mexico City')||data?.weekends?.find(m=>m.id===data?.rounds?.at(-1)?.meetingId);
 const sections=context(data,meeting,names),round=data?.rounds?.find(r=>r.meetingId===meeting?.id);
 if(round){const drivers=round.drivers.filter(d=>brief.drivers.some(name=>name.toLowerCase()===d.name.toLowerCase())),teams=round.teams.filter(t=>brief.teams.includes(t.name));sections.splice(0,sections.length);if(drivers.length)sections.push({headingZh:'相关车手：该站赛后赛季积分',headingEn:'Related drivers: season totals after this round',rows:drivers.map(d=>({zh:`${translated(d.name,names)} · 第 ${d.position} · ${d.points} 分`,en:`${d.name} · P${d.position} · ${d.points} points`}))});if(teams.length)sections.push({headingZh:'相关车队：该站赛后赛季积分',headingEn:'Related constructors: season totals after this round',rows:teams.map(t=>({zh:`${translated(t.name,names)} · 第 ${t.position} · ${t.points} 分`,en:`${t.name} · P${t.position} · ${t.points} points`}))});}
 return {id,kind:'original',format:'news-brief',title:brief.title,titleZh:brief.titleZh,publishedAt:null,indexedAt:item?.indexedAt||fallbackDate,reviewedDate:brief.date,author:'NOBI Racing',sourceName:brief.referenceName,sourceUrl:brief.reference,licenseUrl:null,paragraphsZh:brief.paragraphsZh,paragraphsEn:brief.paragraphsEn,sections,originalTitle:item?.title,noticeZh:brief.unverified?'本站核验说明：报道中的财务与交易说法尚未独立证实。':'本站依据公开报道事实独立撰写的双语新闻简报；不是发布者原文全文译载。',noticeEn:brief.unverified?'NOBI verification note: the reported financial and transaction claims are not independently confirmed.':'An independently written NOBI bilingual news brief based on reported facts, not a full republication of the source.',backgroundSource:sections.length?'F1DB / Marcel Overdijk · CC BY 4.0':null};
}
export function reviewedArticle(id,data,names={}){for(const brief of briefs)for(const url of brief.urls)if(createHash('sha256').update(url).digest('hex').slice(0,24)===id)return reviewedBrief(brief,id,null,data,names,brief.indexedDates?.[url]||null);return null;}

const decodeMetadata=value=>value.replace(/&#(?:x([0-9a-f]+)|([0-9]+));|&(amp|quot|apos|lt|gt|nbsp);/gi,(_match,hex,decimal,name)=>{if(name)return {amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' '}[name.toLowerCase()];const n=parseInt(hex||decimal,hex?16:10);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';});
const safeDescription=value=>typeof value==='string'&&value.trim().length>0&&value.length<=1200&&!/[<>]/.test(value)&&![...value].some(char=>char.charCodeAt(0)<32)?value.trim():null;
/** Read publisher-provided public summaries, never reconstruct or expose the full article. */
export function articleSummary(html){
 if(typeof html!=='string'||html.length>1500000)return null;
 const head=html.split(/<\/head\s*>/i)[0];const values=new Map();
 for(const tag of head.matchAll(/<meta\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)){
  const attributes={};for(const match of tag[0].matchAll(/([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g))attributes[match[1].toLowerCase()]=match[2]??match[3]??match[4];
  const key=(attributes.property||attributes.name||'').toLowerCase();
  if(['og:description','description','twitter:description'].includes(key)&&attributes.content)values.set(key,attributes.content);
 }
 for(const key of ['og:description','description','twitter:description']){
  const raw=values.get(key);if(!raw)continue;
  const text=[...decodeMetadata(raw).replace(/<[^>]*>/g,' ')].map(char=>char.charCodeAt(0)<32?' ':char).join('').replace(/\s+/g,' ').trim();
  if(text.length>=40&&text.length<=1200&&!/[<>]|enable javascript|access denied|verify (?:that )?you are human|captcha|subscribe to (?:read|continue)/i.test(text))return text;
 }
 return null;
}

export function createArticleReader({translateText,validateUrl,fetchImpl=(...args)=>fetch(...args),now=Date.now,timeoutMs=8000}){
 const metadata=new Map(),pending=new Map(),jobs=new Map(),completed=new Map();
 async function fetchSummary(url){
  const old=metadata.get(url);if(old&&old.expiresAt>now())return old.summary;
  if(pending.has(url))return pending.get(url);
  const operation=(async()=>{
   let summary=null;
   try{
    let target=validateUrl(url);if(!target)throw Error('Source allowlist');const signal=AbortSignal.timeout(7000);
    for(let redirects=0;redirects<4;redirects++){
     const response=await fetchImpl(target,{redirect:'manual',signal,headers:{Accept:'text/html','User-Agent':'NOBI-Racing-Newsroom/1.0 (+public-summary-reader)'}});
     if([301,302,303,307,308].includes(response.status)){
      await response.body?.cancel();const location=response.headers.get('location');if(!location)throw Error('Invalid source redirect');target=validateUrl(new URL(location,target).href);if(!target)throw Error('Redirect allowlist');continue;
     }
     if(!response.ok||!response.body||!/^text\/html(?:;|$)/i.test(response.headers.get('content-type')||''))throw Error('Summary unavailable');
     if(Number(response.headers.get('content-length')||0)>1500000)throw Error('Source too large');
     const reader=response.body.getReader(),decoder=new TextDecoder();let html='',bytes=0;
     try{for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>1500000)throw Error('Source too large');html+=decoder.decode(value,{stream:true});if(/<\/head\s*>/i.test(html))break;}}finally{await reader.cancel();}
     summary=articleSummary(html);break;
    }
   }catch{/* A blocked or unavailable publisher still has a useful in-app index note. */}
   metadata.set(url,{summary,expiresAt:now()+(summary?1800000:120000)});
   if(metadata.size>200)metadata.delete(metadata.keys().next().value);
   return summary;
  })();
  pending.set(url,operation);try{return await operation;}finally{pending.delete(url);}
 }
 const build=async(item,feed,data,names={})=>{
  if(!item)return null;
  const original=indexedArticle(item,feed,data,names);if(original.kind==='original')return original;
  const source=item.originalLanguage||item.language||'en';
  const translated=async(value,target='zh-CN')=>{try{return await translateText?.(value,{source,target})||null;}catch{return null;}};
  const knownSummary=safeDescription(item.description),knownSummaryZh=safeDescription(item.descriptionZh);
  const [titleZh,summary]=await Promise.all([item.titleZh||translated(item.title),knownSummary||fetchSummary(item.url)]);
  const article=indexedArticle({...item,titleZh},feed,data,names);
  if(!titleZh){
   article.translationStatus='unavailable';article.titleZh='F1 新闻：中文译文暂不可用';
   article.paragraphsZh[0]=article.paragraphsZh[0].replace('中文标题正在准备，稍后重试即可重新请求翻译。','中文标题暂不可用，可以稍后重试翻译。');
  }
  if(!summary)return article;
  const summaryZh=knownSummaryZh&&/[\u3400-\u9fff]/.test(knownSummaryZh)?knownSummaryZh:await translated(summary);
  const summaryEn=source==='en'?summary:await translated(summary,'en');
  article.detailStatus='summary';article.summaryProvider='publisher-metadata';article.summaryTranslation=source==='zh'?'original':'machine';article.translationStatus=titleZh&&summaryZh?'ready':'unavailable';
  article.paragraphsZh=summaryZh?[summaryZh,'以上为发布者公开新闻摘要的中文内容；完整报道可通过下方来源链接查看。']:['发布者已提供公开新闻摘要，中文译文暂不可用。可以稍后重试。'];
  article.paragraphsEn=summaryEn?[summaryEn,'This is the publisher’s public description. The complete report is available through the optional source link below.']:['The publisher has provided a public description. An English translation is not available yet.'];
  article.noticeZh=source==='zh'?'新闻内容来自发布者公开摘要；此处不转载完整原文。':'发布者公开摘要的机器翻译，可能存在误差；此处不转载完整原文。';
  article.noticeEn='Publisher-provided public summary, machine-translated where needed; not a full republication of the article.';
  return article;
 };
 return async(item,feed,data,names={})=>{
  if(!item)return null;
  const fallback=indexedArticle(item,feed,data,names);if(fallback.kind==='original')return fallback;
  const key=JSON.stringify([item.id,item.url,item.title,item.titleZh||'',item.description||'',item.descriptionZh||'']),cached=completed.get(key);
  if(cached&&cached.expiresAt>now())return cached.article;
  let job=jobs.get(key);
  if(!job){
   if(jobs.size>=12)return {...fallback,translationStatus:'pending'};
   job=build(item,feed,data,names).catch(()=>fallback).then(article=>{
    if(article.translationStatus==='ready'){completed.set(key,{article,expiresAt:now()+(article.detailStatus==='summary'?1800000:120000)});if(completed.size>200)completed.delete(completed.keys().next().value);}
    return article;
   }).finally(()=>jobs.delete(key));
   jobs.set(key,job);
  }
  // A reader opens immediately even when the background headline translator is busy.
  // Its deduplicated job continues and fills the cache for the next automatic retry.
  let timer;
  try{return await Promise.race([job,new Promise(resolve=>{timer=setTimeout(()=>resolve({...fallback,translationStatus:'pending'}),timeoutMs);})]);}finally{clearTimeout(timer);}
 };
}
