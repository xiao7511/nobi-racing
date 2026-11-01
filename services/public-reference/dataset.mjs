import assert from 'node:assert/strict';
import {load,JSON_SCHEMA} from 'js-yaml';
import {YEAR,SOURCE,LICENSE,LICENSE_URL,tracks,grandsPrix,teams} from './config.mjs';
export const text=(value,max=200)=>{assert.equal(typeof value,'string');assert.ok(value.length>0&&value.length<=max&&!/[<>\r\n]/.test(value));return value;};
const id=value=>{assert.ok(Number.isSafeInteger(value)&&value>0);return value;};
const points=value=>{if(value==null)return 0;assert.ok(typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=5000);assert.equal(Math.round(value*1000)/1000,value);return Math.round(value*1000);};
const decimal=value=>(value/1000).toFixed(3).replace(/\.?0+$/,'')||'0';
export function yaml(value){assert.ok(typeof value==='string'&&value.length<200000);return load(value,{schema:JSON_SCHEMA,json:false});}
const list=value=>{assert.ok(Array.isArray(value)&&value.length<=40);return value;};
function start(date,time){if(!date||!time)return null;const stamp=new Date(date+'T'+String(time).padStart(5,'0')+':00Z');assert.ok(Number.isFinite(stamp.getTime())&&stamp.getUTCFullYear()===YEAR);return stamp.toISOString();}
function offset(date,zone){const name=new Intl.DateTimeFormat('en',{timeZone:zone,timeZoneName:'longOffset'}).formatToParts(new Date(date)).find(part=>part.type==='timeZoneName').value;if(name==='GMT')return '00:00:00';return name.replace('GMT','').replace(/^\+/,'')+':00';}
function elapsed(value){if(typeof value!=='string'||!/^\d+:[0-5]\d:[0-5]\d\.\d{3}$/.test(value))return null;const [h,m,s]=value.split(':').map(Number);return (h*3600+m*60+s)*1000;}
export async function buildDataset({revision,directories,read,labels={},names={},now=Date.now()}){
 assert.match(revision,/^[a-f0-9]{40}$/);assert.ok(directories.length>0&&directories.length<=30);
 const sourceRaces=await Promise.all(directories.map(async directory=>{
  assert.match(directory,/^[0-9]{2}-[a-z-]+$/);const base=`src/data/seasons/${YEAR}/races/${directory}/`;
  const race=yaml(await read(base+'race.yml'));id(race.id);id(race.round);assert.equal(typeof race.circuitId,'string');
  const result={directory,base,race};
  for(const [key,file] of Object.entries({results:'race-results.yml',qualifying:'qualifying-results.yml',driverStandings:'driver-standings.yml',teamStandings:'constructor-standings.yml'})){
   const value=await read(base+file,true);result[key]=value?list(yaml(value)):[];
  }
  return result;
 }));
 sourceRaces.sort((a,b)=>a.race.round-b.race.round);assert.equal(new Set(sourceRaces.map(row=>row.race.id)).size,sourceRaces.length);
 const driverIds=[...new Set(sourceRaces.flatMap(row=>[...row.results,...row.qualifying,...row.driverStandings].map(entry=>text(entry.driverId))))];assert.ok(driverIds.length<=40);
 const people=new Map(await Promise.all(driverIds.map(async driverId=>{assert.match(driverId,/^[a-z0-9-]+$/);const person=yaml(await read('src/data/drivers/'+driverId+'.yml'));assert.equal(person.id,driverId);const name=text(person.firstName)+' '+text(person.lastName).toUpperCase();return [driverId,{name,number:person.permanentNumber}];})));
 const numbers=new Map();for(const row of sourceRaces)for(const entry of [...row.qualifying,...row.results])if(entry.driverNumber)numbers.set(entry.driverId,id(entry.driverNumber));
 const weekends=[],rounds=[],news=[];
 for(const row of sourceRaces){
  const r=row.race;const track=tracks[r.circuitId]||Object.values(tracks).find(([key])=>key.toLowerCase()===r.circuitId);assert.ok(track,'Unknown F1DB circuit: '+r.circuitId);
  const gp=grandsPrix[r.grandPrixId];assert.ok(gp,'Unknown Grand Prix');const raceStart=start(r.date,r.time);if(!raceStart)continue;
  const winner=row.results.find(entry=>entry.position===1),duration=elapsed(winner?.time);
  const raceEnd=new Date(Date.parse(raceStart)+(duration||2*3600000)).toISOString();const sessions=[];
  for(const [field,kind,name,duration] of [['freePractice1','practice1','Practice 1',60],['freePractice2','practice2','Practice 2',60],['freePractice3','practice3','Practice 3',60],['sprintQualifying','sprintQualifying','Sprint Qualifying',60],['sprintRace','sprint','Sprint',30],['qualifying','qualifying','Qualifying',60],['race','race','Race',120]]){
   const begins=field==='race'?raceStart:start(r[field+'Date'],r[field+'Time']);if(!begins)continue;
   const actual=field==='race'&&elapsed(winner?.time)!==null;
   sessions.push({id:r.id*10+sessions.length+1,name,kind,startsAt:begins,endsAt:field==='race'?raceEnd:new Date(Date.parse(begins)+duration*60000).toISOString(),endEstimated:!actual});
  }
  sessions.sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt));
  const endsAt=sessions.at(-1).endsAt;const meeting={id:r.id,name:gp[0],nameZh:gp[1],circuit:track[0],circuitZh:labels[track[0]]||track[0],location:track[0],locationZh:labels[track[0]]||track[0],startsAt:sessions[0].startsAt,endsAt,gmtOffset:offset(raceStart,track[1]),cancelled:false,sprint:sessions.some(session=>session.kind==='sprint'),sessions};weekends.push(meeting);
  const numberFor=driverId=>String(numbers.get(driverId)||people.get(driverId)?.number||'');
  const driverName=driverId=>people.get(driverId)?.name||text(driverId);
  const zhName=driverId=>names[driverName(driverId)]||driverName(driverId);
  if(row.results.length&&Date.parse(raceEnd)+1800000<=now){
   assert.ok(row.driverStandings.length&&row.teamStandings.length,'Completed race is missing standings');
   const racePoints=new Map(row.results.map(entry=>[entry.driverId,points(entry.points)])),teamPoints=new Map();
   for(const entry of row.results){const key=text(entry.constructorId);teamPoints.set(key,(teamPoints.get(key)||0)+points(entry.points));}
   const raceTeams=new Map(row.results.map(entry=>[entry.driverId,teams[entry.constructorId]||text(entry.constructorId)]));
   const toEntry=(entry,driver)=>{const key=driver?text(entry.driverId):text(entry.constructorId);const current=points(entry.points),gain=driver?(racePoints.get(key)||0):(teamPoints.get(key)||0);assert.ok(current>=gain);const entryId=driver?numberFor(key):(teams[key]||key);text(entryId);return {id:entryId,name:driver?driverName(key):(teams[key]||key),team:driver?(raceTeams.get(key)||''):(teams[key]||key),color:'8290A1',position:id(entry.position),positionStart:null,points:decimal(current),pointsStart:decimal(current-gain)};};
   const drivers=row.driverStandings.map(entry=>toEntry(entry,true)),constructors=row.teamStandings.map(entry=>toEntry(entry,false));
   for(const entries of [drivers,constructors]){assert.equal(new Set(entries.map(entry=>entry.id)).size,entries.length);for(let i=1;i<entries.length;i++){assert.ok(entries[i].position>entries[i-1].position&&Number(entries[i].points)<=Number(entries[i-1].points));}}
   rounds.push({id:r.id,meetingId:r.id,circuit:track[0],circuitZh:meeting.circuitZh,endsAt,drivers,teams:constructors});
  }
  for(const [kind,classification,at] of [['race',row.results,raceStart],['qualifying',row.qualifying,start(r.qualifyingDate,r.qualifyingTime)]]){
   if(!at||Date.parse(at)+3*3600000>now||classification.length<3)continue;
   const top=classification.filter(entry=>Number.isInteger(entry.position)&&entry.position>0).sort((a,b)=>a.position-b.position).slice(0,3);if(top.length<3)continue;
   const title=kind==='race'?`${gp[0]}: ${driverName(top[0].driverId)} wins`:`${gp[0]} qualifying: ${driverName(top[0].driverId)} leads the classification`;
   const titleZh=kind==='race'?`${gp[1]}正赛：${zhName(top[0].driverId)}夺冠`:`${gp[1]}排位赛：${zhName(top[0].driverId)}位列第一`;
   const summary=`F1DB records ${top.map(entry=>driverName(entry.driverId)).join(', ')} as the top three in this ${kind==='race'?'race':'qualifying'} classification. NOBI Racing summary of open data; this is not live timing.`;
   const summaryZh=`${at.slice(0,10)}，F1DB 收录的${gp[1]}${kind==='race'?'正赛':'排位赛'}前三名为${top.map(entry=>zhName(entry.driverId)).join('、')}。本站根据开放赛果整理，修订请核对来源及主办方公告。`;
   news.push({title,titleZh,summary,summaryZh,translationStatus:'original',url:`${SOURCE}/blob/main/${row.base}${kind==='race'?'race-results.yml':'qualifying-results.yml'}`,publishedAt:at});
  }
 }
 assert.ok(weekends.length>0&&rounds.length>0);news.sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
 return {revision,sourceUpdatedAt:new Date(now).toISOString(),weekends,rounds,news:news.slice(0,20),attribution:{source:SOURCE,license:LICENSE,licenseUrl:LICENSE_URL,adaptation:'NOBI Racing bilingual labels and factual summaries. Session end times are estimates.'}};
}
