<script setup lang="ts">
import {safeHref} from '../lib/navigation-links';
import {computed,onScopeDispose,ref,watch} from 'vue';
import {useRouter} from 'vue-router';
import {usePage} from '../composables/usePage';
import {useResource} from '../composables/useResource';
import ResourceState from './ResourceState.vue';
import {seasonInsights,entries,gained,gap,milli,trendPath,type InsightEntry,type InsightType,type InsightRound} from '../api/season-insights';
import {publicReference} from '../lib/urls';
import names from '../content/stats-names.json';
const {t,locale,route,preferences}=usePage();const router=useRouter();
const type=computed<InsightType>(()=>route.query.type==='team'?'team':'driver');
const state=useResource(seasonInsights,[],{publicCacheKey:"season-insights",volatile:true,refreshMs:60000,preserveWhileRefreshing:true});
const now=ref(Date.now());const timer=setInterval(()=>{now.value=Date.now();},1000);onScopeDispose(()=>clearInterval(timer));
const fresh=computed(()=>state.data.value?.status==='ready'&&Date.parse(state.data.value.expiresAt!)>now.value);
const rounds=computed(()=>fresh.value?state.data.value!.rounds:[]);
const requested=computed(()=>String(route.query.round||''));
const round=computed(()=>requested.value?rounds.value.find(item=>String(item.id)===requested.value):rounds.value.at(-1));
const rows=computed(()=>round.value?entries(round.value,type.value):[]);
const history=computed(()=>round.value?rounds.value.filter(item=>Date.parse(item.endsAt)<=Date.parse(round.value!.endsAt)):[]);
const search=ref(''),sort=ref('position'),first=ref(''),second=ref('');
watch([type,()=>round.value?.id,()=>route.query.q],()=>{search.value=typeof route.query.q==='string'?route.query.q.slice(0,100):'';sort.value='position';first.value=rows.value[0]?.id||'';second.value=rows.value[1]?.id||'';},{immediate:true});
const label=(name:string)=>locale.value==='zh-CN'&&Object.hasOwn(names,name)?names[name as keyof typeof names]:name;
const number=(value:number|string)=>new Intl.NumberFormat(locale.value,{maximumFractionDigits:3}).format(Number(value));
const signed=(value:number)=>(value>0?'+':'')+number(value);
const stamp=(value:string)=>new Intl.DateTimeFormat(locale.value,{month:'short',day:'numeric',timeZone:preferences.timeZone}).format(new Date(value));
const roundName=(item:InsightRound)=>locale.value==='zh-CN'?item.circuitZh||item.circuit:item.circuit;
const visible=computed(()=>rows.value.filter(row=>[row.name,label(row.name),row.team,label(row.team),'#'+row.id].join(' ').toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase())).sort((a,b)=>sort.value==='gain'?gained(b)-gained(a)||a.position-b.position:sort.value==='points'?milli(b.points)-milli(a.points)||a.position-b.position:a.position-b.position));
const biggest=computed(()=>[...rows.value].sort((a,b)=>gained(b)-gained(a)||a.position-b.position)[0]);
const comparison=computed(()=>[first.value,second.value].map(id=>rows.value.find(row=>row.id===id)).filter((row):row is InsightEntry=>!!row));
const chartMax=computed(()=>Math.max(1,...history.value.flatMap(item=>entries(item,type.value).filter(row=>[first.value,second.value].includes(row.id)).map(row=>Number(row.points)))));
const at=(item:InsightRound,id:string)=>entries(item,type.value).find(row=>row.id===id);
const isFollowed=(row:InsightEntry)=>type.value==='driver'?preferences.followedDriverIds.includes('openf1:driver:'+row.id):preferences.followedTeamIds.includes('openf1:team:'+row.id);
function toggleFollow(row:InsightEntry){if(type.value==='driver')preferences.toggleFollowed('openf1:driver:'+row.id);else preferences.toggleTeam('openf1:team:'+row.id);}
function selectType(value:string){void router.replace({query:{...route.query,type:value}});}
function selectRound(value:string){void router.replace({query:{...route.query,round:value||undefined}});}
</script>
<template>
  <section class="season-insights" data-testid="season-insights">
    <div class="insight-controls">
      <div class="filter-group" role="group" :aria-label="t('stats.standings')"><button v-for="item in ['driver','team']" :key="item" :aria-pressed="type===item" @click="selectType(item)">{{t(item==='driver'?'stats.drivers':'stats.teams')}}</button></div>
      <label class="insight-select">{{t('insights.asOf')}}<select :aria-label="t('insights.asOf')" :value="requested" :disabled="!rounds.length" @change="selectRound(($event.target as HTMLSelectElement).value)"><option value="">{{t('insights.latest')}}</option><option v-for="item in [...rounds].reverse()" :key="item.id" :value="String(item.id)">{{roundName(item)}} · {{stamp(item.endsAt)}}</option></select></label>
    </div>
    <ResourceState :focus-on-load="false" :loading="state.loading.value&&!state.data.value" :error="state.error.value" @retry="state.reload">
      <template v-if="state.data.value">
        <div v-if="!fresh" class="insight-unavailable" role="status"><h2>{{t('insights.'+(state.data.value.status==='ready'?'pending':state.data.value.status))}}</h2><p class="muted">{{t('insights.noFallback')}}</p><button class="button" @click="state.reload">{{t('insights.refresh')}}</button></div>
        <div v-else-if="!round" class="insight-unavailable" role="status"><h2>{{t('insights.invalidRound')}}</h2><button class="button" @click="selectRound('')">{{t('insights.latest')}}</button></div>
        <template v-else>
          <p class="insight-asof">{{t('insights.through',{circuit:roundName(round),date:stamp(round.endsAt)})}}<RouterLink :to="'/weekends/'+round.meetingId">{{t('insights.weekend')}} ↗</RouterLink></p>
          <div class="insight-metrics" aria-live="polite">
            <article><span>{{t('insights.leader')}}</span><strong>{{number(rows[0]?.points||0)}}<small>{{t('stats.points')}}</small></strong><p>{{label(rows[0]?.name||'—')}}</p></article>
            <article><span>{{t('insights.leadGap')}}</span><strong>{{rows[1]?number(gap(rows[0]!,rows[1])):'—'}}<small>{{t('stats.points')}}</small></strong><p>{{t('insights.overSecond')}}</p></article>
            <article><span>{{t('insights.biggestGain')}}</span><strong>{{biggest?signed(gained(biggest)):'—'}}<small>{{t('stats.points')}}</small></strong><p>{{label(biggest?.name||'—')}}</p></article>
            <article><span>{{t('insights.coverage')}}</span><strong>{{history.length}}<small>{{t('insights.snapshots')}}</small></strong><p>{{t('insights.atRound',{count:rows.length})}}</p></article>
          </div>
          <div class="insight-analysis">
            <section class="insight-chart">
              <div class="section-heading"><h2>{{t('insights.trend')}}</h2><span class="caption">{{t('insights.cumulative')}}</span></div>
              <div class="insight-comparators"><label v-for="(id,index) in [first,second]" :key="index">{{t('insights.compare'+(index+1))}}<select :aria-label="t('insights.compare'+(index+1))" :value="id" @change="index===0?first=($event.target as HTMLSelectElement).value:second=($event.target as HTMLSelectElement).value"><option v-for="row in rows" :key="row.id" :value="row.id" :disabled="row.id===(index===0?second:first)">{{label(row.name)}}</option></select></label></div>
              <svg class="insight-trend" viewBox="0 0 720 252" role="img" :aria-label="t('insights.trendAlt')">
                <g v-for="tick in [0,0.5,1]" :key="tick"><line x1="48" x2="688" :y1="210-tick*180" :y2="210-tick*180"/><text x="40" :y="214-tick*180" text-anchor="end">{{number(chartMax*tick)}}</text></g>
                <g v-for="(row,index) in comparison" :key="row.id" :class="'trend-series series-'+index"><path :d="trendPath(history,type,row.id,chartMax)"/><template v-for="(item,i) in history" :key="item.id"><circle v-if="at(item,row.id)" :cx="48+(history.length<2?0:i/(history.length-1)*640)" :cy="210-Number(at(item,row.id)!.points)/chartMax*180" r="3"><title>{{label(row.name)}} · {{roundName(item)}} · {{at(item,row.id)!.points}}</title></circle></template></g>
                <text x="48" y="242">{{roundName(history[0]!)}}</text><text x="688" y="242" text-anchor="end">{{history.length>1?roundName(round):''}}</text>
              </svg>
              <div class="insight-legend"><span v-for="(row,index) in comparison" :key="row.id" :class="'legend-'+index">{{index+1}} · {{label(row.name)}}<strong>{{number(row.points)}}</strong></span></div><p class="caption">{{t('insights.trendNote')}}</p>
              <details class="insight-history"><summary>{{t('insights.viewHistory')}}</summary><div class="table-wrap"><table><caption class="sr-only">{{t('insights.trend')}}</caption><thead><tr><th scope="col">{{t('insights.round')}}</th><th v-for="row in comparison" :key="row.id" scope="col">{{label(row.name)}}</th></tr></thead><tbody><tr v-for="item in history" :key="item.id"><th scope="row">{{roundName(item)}}</th><td v-for="row in comparison" :key="row.id">{{at(item,row.id)?.points??'—'}}</td></tr></tbody></table></div></details>
            </section>
            <aside class="insight-duel"><p class="eyebrow">{{t('insights.headToHead')}}</p><div v-for="(row,index) in comparison" :key="row.id" :class="'duel-entry legend-'+index"><span>{{index+1}} · {{label(row.name)}}</span><strong>{{number(row.points)}}<small>{{t('stats.points')}}</small></strong><div class="duel-bar"><span :style="{width:(Number(row.points)/Math.max(1,...comparison.map(entry=>Number(entry.points)))*100)+'%'}"/></div><p>{{t('insights.raceGain')}} <b>{{signed(gained(row))}}</b> · P{{row.position}}</p></div><p v-if="comparison.length===2" class="duel-gap">{{t('insights.comparisonGap',{points:number(Math.abs(gap(comparison[0]!,comparison[1]!)))})}}</p><p class="caption">{{t(publicReference?'publicData.gainNote':'insights.gainNote')}}</p></aside>
          </div>
          <section class="insight-standings">
            <div class="section-heading"><h2>{{t(type==='driver'?'stats.drivers':'stats.teams')}}</h2><span class="caption">{{t('insights.results',{shown:visible.length,total:rows.length})}}</span></div>
            <div class="insight-table-controls"><label>{{t('insights.search')}}<input v-model="search" type="search" :placeholder="t('insights.searchPlaceholder')" maxlength="100"/></label><label>{{t('insights.sort')}}<select :aria-label="t('insights.sort')" v-model="sort"><option value="position">{{t('stats.position')}}</option><option value="points">{{t('stats.points')}}</option><option value="gain">{{t('insights.raceGain')}}</option></select></label></div>
            <div class="table-wrap"><table data-testid="insight-standings"><caption class="sr-only">{{t('insights.standingsCaption',{circuit:roundName(round)})}}</caption><thead><tr><th scope="col">{{t('stats.position')}}</th><th scope="col">{{t(type==='driver'?'stats.driver':'stats.team')}}</th><th scope="col">{{t('insights.movement')}}</th><th scope="col">{{t('insights.raceGain')}}</th><th scope="col">{{t('insights.toLeader')}}</th><th scope="col">{{t('stats.points')}}</th></tr></thead><tbody><tr v-for="row in visible" :key="row.id"><td class="position">{{String(row.position).padStart(2,'0')}}</td><th scope="row"><span class="insight-entrant"><span class="entrant-code">{{type==='driver'?'#'+row.id:String(row.position).padStart(2,'0')}}</span><span>{{label(row.name)}}<small v-if="type==='driver'">{{row.team?label(row.team):t('insights.teamUnavailable')}}</small></span></span><button type="button" class="entrant-follow" :aria-pressed="isFollowed(row)" :aria-label="t(isFollowed(row)?'world.unfollowNamed':'world.followNamed',{name:label(row.name)})" @click="toggleFollow(row)">{{t(isFollowed(row)?'world.following':'world.follow')}}</button></th><td><span v-if="row.positionStart" :class="{'insight-up':row.positionStart>row.position}">{{row.positionStart===row.position?'—':(row.positionStart>row.position?'↑ ':'↓ ')+Math.abs(row.positionStart-row.position)}}</span><span v-else>—</span></td><td>{{signed(gained(row))}}</td><td>{{row.position===rows[0]?.position?'—':number(gap(rows[0]!,row))}}</td><td class="points">{{number(row.points)}}</td></tr></tbody></table></div>
            <div v-if="!visible.length" class="empty-inline" role="status"><p>{{t('insights.noMatch')}}</p><button class="button" @click="search='';sort='position'">{{t('insights.clear')}}</button></div><p class="caption insight-table-note">{{t(publicReference?'publicData.gainNote':'insights.gainNote')}} {{t('insights.movementNote')}}</p>
          </section>
          <p class="insight-source caption">{{t('official.synced')}} {{new Date(state.data.value.syncedAt!).toLocaleString(locale,{timeZone:preferences.timeZone})}} · <a :href="safeHref(state.data.value.sourceUrl)" :target="(safeHref(state.data.value.sourceUrl))?.startsWith('#/')?undefined:'_blank'" rel="noopener noreferrer">{{state.data.value.source}} ↗</a> · <a :href="safeHref(state.data.value.licenseUrl)" :target="(safeHref(state.data.value.licenseUrl))?.startsWith('#/')?undefined:'_blank'" rel="noopener noreferrer">{{state.data.value.license}} ↗</a><span>{{t(publicReference?'publicData.statsNote':'insights.sourceNote')}}</span></p>
        </template>
      </template>
    </ResourceState>
  </section>
</template>
