import type { ApiSchemas } from '@nobi/contracts/api';
import { WeekendsResponse } from '@nobi/contracts/validators';
import { metadataJson } from './official-news';
import {validReferenceSource} from './reference-source';
export type Weekend = ApiSchemas['RaceWeekend'];
export type Weekends = ApiSchemas['WeekendsResponse'];
export function validateWeekends(value: unknown): Weekends {
  if (!WeekendsResponse(value)) throw new Error('Invalid weekend response');
  const data=value as Weekends;
  if(!validReferenceSource(data))throw new Error('Invalid source attribution');
  if (data.status !== 'ready') { if (data.items.length || data.syncedAt || data.expiresAt) throw new Error('Unavailable weekends'); return data; }
  if (!data.syncedAt || !data.expiresAt || Date.parse(data.expiresAt)<=Date.now() || Date.parse(data.expiresAt)-Date.parse(data.syncedAt)!==21600000) throw new Error('Expired weekends');
  const ids=new Set<number>(), sessionIds=new Set<number>();
  for (const item of data.items) {
    if(ids.has(item.id) || Date.parse(item.endsAt)<Date.parse(item.startsAt)) throw new Error('Invalid weekend'); ids.add(item.id);
    for(const text of [item.name,item.nameZh,item.circuit,item.circuitZh,item.location,item.locationZh]) if(text.length>200 || /[<>]/.test(text)) throw new Error('Invalid text');
    for(const session of item.sessions) { if(sessionIds.has(session.id)||Date.parse(session.endsAt)<Date.parse(session.startsAt)) throw new Error('Invalid session'); sessionIds.add(session.id); }
  }
  return data;
}
export async function weekends(signal: AbortSignal) { return validateWeekends(await metadataJson('/api/v1/weekends',signal)); }
const aliases: Record<string,string[]> = {
  'Australian Grand Prix':['australian grand prix','melbourne'], 'Chinese Grand Prix':['chinese grand prix','china grand prix','shanghai'], 'Japanese Grand Prix':['japanese grand prix','suzuka'],
  'Bahrain Grand Prix':['bahrain grand prix'], 'Saudi Arabian Grand Prix':['saudi arabian grand prix','jeddah'], 'Miami Grand Prix':['miami'], 'Canadian Grand Prix':['canadian grand prix','montreal','montréal'],
  'Monaco Grand Prix':['monaco'], 'Barcelona Grand Prix':['barcelona'], 'Austrian Grand Prix':['austrian grand prix','spielberg'], 'British Grand Prix':['british grand prix','silverstone'],
  'Belgian Grand Prix':['belgian grand prix','spa-francorchamps'], 'Hungarian Grand Prix':['hungarian grand prix','hungaroring'], 'Dutch Grand Prix':['dutch grand prix','zandvoort'],
  'Italian Grand Prix':['italian grand prix','monza'], 'Spanish Grand Prix':['spanish grand prix','madrid'], 'Azerbaijan Grand Prix':['azerbaijan','baku'],
  'Singapore Grand Prix':['singapore'], 'United States Grand Prix':['united states grand prix','austin'], 'Mexico City Grand Prix':['mexico','mexican grand prix'],
  'São Paulo Grand Prix':['são paulo','sao paulo','brazilian grand prix','interlagos'], 'Las Vegas Grand Prix':['las vegas'], 'Qatar Grand Prix':['qatar','lusail'], 'Abu Dhabi Grand Prix':['abu dhabi','yas marina'],
};
export function relatedNews<T extends {title:string;summary:string;publishedAt:string|null}>(weekend:Weekend,news:T[]):T[] {
  const keys=aliases[weekend.name]||[weekend.name.toLowerCase()];
  return news.filter(item=>item.publishedAt&&Date.parse(item.publishedAt)>=Date.parse(weekend.startsAt)-7*86400000&&Date.parse(item.publishedAt)<=Date.parse(weekend.endsAt)+3*86400000&&keys.some(key=>(item.title+' '+item.summary).toLowerCase().includes(key))).slice(0,3);
}
