import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildDataset,yaml} from './dataset.mjs';
const people=['kimi-antonelli','george-russell','lewis-hamilton'];
function fixture(){
 const base='src/data/seasons/2026/races/01-china/';const files={};
 files[base+'race.yml']={id:1000,round:1,date:'2026-03-15',time:'09:00',grandPrixId:'china',circuitId:'shanghai',freePractice1Date:'2026-03-13',freePractice1Time:'03:30',qualifyingDate:'2026-03-14',qualifyingTime:'07:00'};
 files[base+'race-results.yml']=people.map((driverId,i)=>({driverId,driverNumber:[12,63,44][i],constructorId:i===2?'ferrari':'mercedes',position:i+1,points:[25,18,15][i]}));
 files[base+'qualifying-results.yml']=files[base+'race-results.yml'];
 files[base+'driver-standings.yml']=people.map((driverId,i)=>({driverId,position:i+1,points:[365,242,241][i]}));
 files[base+'constructor-standings.yml']=[{constructorId:'mercedes',position:1,points:607},{constructorId:'ferrari',position:2,points:474}];
 for(const [i,driverId]of people.entries())files['src/data/drivers/'+driverId+'.yml']={id:driverId,firstName:['Kimi','George','Lewis'][i],lastName:['Antonelli','Russell','Hamilton'][i],permanentNumber:[12,63,44][i]};
 return {files,options:{revision:'a'.repeat(40),directories:['01-china'],now:Date.parse('2026-11-01T00:00:00Z'),labels:{Shanghai:'上海'},names:{'Kimi ANTONELLI':'基米·安东内利'},read:async(path,optional)=>{if(!files[path]&&optional)return null;assert.ok(files[path],path);return JSON.stringify(files[path]);}}};
}
test('public data preserves source totals and derives race gains without inventing pre-race ranks',async()=>{
 const {options}=fixture();const data=await buildDataset(options);assert.equal(data.rounds.length,1);assert.equal(data.rounds[0].teams[0].points,'607');assert.equal(data.rounds[0].teams[0].pointsStart,'564');assert.equal(data.rounds[0].drivers[0].pointsStart,'340');assert.equal(data.rounds[0].drivers[0].positionStart,null);assert.ok(data.weekends[0].sessions.every(session=>session.endEstimated));assert.equal(data.news[0].translationStatus,'original');assert.ok(data.news[0].url.startsWith('https://github.com/f1db/f1db/'));assert.ok(data.news[0].titleZh.includes('基米·安东内利'));
});
test('duplicate source ranks, wrong identities and unknown venues fail closed',async()=>{
 const duplicate=fixture();duplicate.files['src/data/seasons/2026/races/01-china/driver-standings.yml'][1].position=1;await assert.rejects(buildDataset(duplicate.options));
 const venue=fixture();venue.files['src/data/seasons/2026/races/01-china/race.yml'].circuitId='unknown';await assert.rejects(buildDataset(venue.options));
 assert.throws(()=>yaml('payload: !!js/function function(){}'));
});
test('future classifications are not presented as completed-race news',async()=>{const {options}=fixture();options.now=Date.parse('2026-03-15T10:00:00Z');await assert.rejects(buildDataset(options));});
