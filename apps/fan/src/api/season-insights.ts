import { SeasonInsightsResponse } from '@nobi/contracts/validators';
import type { ApiSchemas } from '@nobi/contracts/api';
import { metadataJson } from './official-news';
import {validReferenceSource} from './reference-source';
export type InsightEntry=ApiSchemas['SeasonInsightEntry'];
export type InsightRound=ApiSchemas['SeasonInsightRound'];
export type Insights=ApiSchemas['SeasonInsightsResponse'];
export type InsightType='driver'|'team';
export const entries=(round:InsightRound,type:InsightType)=>type==='driver'?round.drivers:round.teams;
export const milli=(value:string)=>{const [whole,fraction='']=value.split('.');return Number(whole)*1000+Number(fraction.padEnd(3,'0'));};
export const gained=(entry:InsightEntry)=>(milli(entry.points)-milli(entry.pointsStart))/1000;
export const gap=(leader:InsightEntry,entry:InsightEntry)=>(milli(leader.points)-milli(entry.points))/1000;
export function validateInsights(value:unknown):Insights {
  if(!SeasonInsightsResponse(value))throw new Error('Invalid season reference');
  const data=value as Insights;
  if(!validReferenceSource(data))throw new Error('Invalid source attribution');
  if(!['ready','empty'].includes(data.status)){if(data.rounds.length||data.syncedAt||data.expiresAt)throw new Error('Unavailable standings');return data;}
  const now=Date.now();
  if(!data.syncedAt||!data.expiresAt||Date.parse(data.syncedAt)>now+60000||Date.parse(data.expiresAt)<=now||Date.parse(data.expiresAt)-Date.parse(data.syncedAt)!==21600000)throw new Error('Expired standings');
  if((data.status==='ready')!==!!data.rounds.length)throw new Error('Standings status');
  const ids=new Set<number>(),meetings=new Set<number>();let previous=0;
  for(const round of data.rounds){
    const ended=Date.parse(round.endsAt);
    if(ids.has(round.id)||meetings.has(round.meetingId)||ended<=previous||ended+1800000>now||!round.endsAt.startsWith('2026-'))throw new Error('Invalid completed session');
    ids.add(round.id);meetings.add(round.meetingId);previous=ended;
    for(const rows of [round.drivers,round.teams]){
      const rowIds=new Set<string>(),positions=new Set<number>();let points=Infinity,position=0;
      for(const row of rows){
        if(rowIds.has(row.id)||positions.has(row.position)||row.position<=position||milli(row.points)>points||milli(row.points)>5000000||milli(row.pointsStart)>5000000)throw new Error('Invalid standing order');
        for(const text of [row.name,row.id,row.team,round.circuit,round.circuitZh])if(/[<>]/.test(text)||Array.from(text).some(character=>character.charCodeAt(0)<32))throw new Error('Invalid label');
        rowIds.add(row.id);positions.add(row.position);points=milli(row.points);position=row.position;
      }
    }
  }
  return data;
}
export async function seasonInsights(signal:AbortSignal){return validateInsights(await metadataJson('/api/v1/season-insights',signal));}
export function trendPath(rounds:InsightRound[],type:InsightType,id:string,max:number):string {
  let connected=false;
  return rounds.map((round,index)=>{
    const row=entries(round,type).find(item=>item.id===id);if(!row){connected=false;return '';}
    const x=48+(rounds.length<2?0:index/(rounds.length-1)*640),y=210-(milli(row.points)/1000)/Math.max(max,1)*180;
    const command=(connected?'L':'M')+x.toFixed(2)+','+y.toFixed(2);connected=true;return command;
  }).join(' ');
}
