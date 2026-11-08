import type {NewsMedia,NewsMediaItem} from '../api/newsroom';
import {relatedNews,type Weekends} from '../api/weekends';

export type HomeNewsSlide=NewsMediaItem&{imageUrl:string;sourceDate:string};
const imageAllowed=(value:string|null)=>{
 try{const url=new URL(value||'');return url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&['media.formula1.com','d2n9h2wits23hf.cloudfront.net'].includes(url.hostname);}catch{return false;}
};

/** Match the actual latest started weekend, never borrow another race's imagery. */
export function homeNewsSlides(calendar:Weekends|null|undefined,media:NewsMedia|undefined,now=Date.now()):HomeNewsSlide[]{
 if(calendar?.status!=='ready'||!calendar.expiresAt||!Number.isFinite(Date.parse(calendar.expiresAt))||Date.parse(calendar.expiresAt)<=now||!media||!['ready','delayed'].includes(media.status))return [];
 const meeting=calendar.items.filter(item=>!item.cancelled&&Date.parse(item.startsAt)<=now).sort((a,b)=>Date.parse(b.startsAt)-Date.parse(a.startsAt))[0];
 if(!meeting)return [];
 const seen=new Set<string>();
 const candidates=media.photos.filter(item=>{
  const at=item.publishedAt||item.updatedAt;
  if(item.kind!=='photo'||!/^[a-f0-9]{24}$/.test(item.id)||!imageAllowed(item.imageUrl)||!at||!Number.isFinite(Date.parse(at))||Date.parse(at)>now+300000||now-Date.parse(at)>7*86400000||seen.has(item.id))return false;
  if(/\bbet(?:ting|\s*builder)|gambl|\bodds\b|博彩|投注|赔率/i.test(item.title+' '+(item.summary||'')))return false;
  const imageYear=item.imageUrl?.match(/\/(?:trackside-images|fom-website)\/(20\d{2})\//i)?.[1];
  if(imageYear&&imageYear!==meeting.startsAt.slice(0,4))return false;
  seen.add(item.id);return true;
 }).map(item=>({...item,imageUrl:item.imageUrl!,sourceDate:(item.publishedAt||item.updatedAt)!,publishedAt:(item.publishedAt||item.updatedAt)!,summary:item.summary||''})).sort((a,b)=>b.sourceDate.localeCompare(a.sourceDate));
 const matching=relatedNews(meeting,candidates.map(item=>({id:item.id,title:item.title,summary:item.summary,publishedAt:item.sourceDate})));
 return matching.map(item=>({...candidates.find(candidate=>candidate.id===item.id)!,publishedAt:media.photos.find(candidate=>candidate.id===item.id)!.publishedAt}));
}
