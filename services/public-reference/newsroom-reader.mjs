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
 const brief=item&&briefs.find(b=>b.urls.includes(item.url));
 if(brief)return reviewedBrief(brief,item.id,item,data,names);
 if(!item)return null;const matched=feed.topics.filter(t=>item.topics.includes(t.id));const race=matched.find(t=>t.kind==='race');const meeting=data?.weekends?.find(m=>m.name===race?.name);const namesZh=matched.map(t=>t.nameZh).join('、'),namesEn=matched.map(t=>t.name).join(', ');
 return {id:item.id,kind:'index-note',title:item.titleEn||item.language==='en'&&item.title||`F1 update${namesEn?': '+namesEn:''}`,titleZh:item.titleZh||item.title,publishedAt:null,indexedAt:item.indexedAt,sourceName:item.publisher,sourceUrl:item.url,author:'NOBI Racing',licenseUrl:null,
  paragraphsZh:[`公开新闻索引收录了 ${item.publisher} 的一则报道${namesZh?'，涉及'+namesZh:''}。可核对的标题信息为：“${item.titleZh||item.title}”。`, '目前该来源未提供本站可以公开翻译、转载的完整正文。这里仅展示索引信息和本站独立整理的资料，不补写未取得的原文内容。'],
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
