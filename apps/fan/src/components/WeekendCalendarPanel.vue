<script setup lang="ts">
import {safeHref,newsHref} from '../lib/navigation-links';
import { computed, onScopeDispose, ref } from 'vue';
import { weekends, relatedNews, type Weekend } from '../api/weekends';
import { latestNews } from '../api/latest-news';
import { useResource } from '../composables/useResource';
import { usePage } from '../composables/usePage';
import ResourceState from './ResourceState.vue';
import {publicReference} from '../lib/urls';
import CircuitMap from './CircuitMap.vue';
const props=defineProps<{ meetingId?: number }>();
const {t,locale,preferences}=usePage();
const state=useResource(weekends,[],{publicCacheKey:"weekends",volatile:true,preserveWhileRefreshing:true});
const news=useResource(latestNews,[],{publicCacheKey:"latest-news",volatile:true,preserveWhileRefreshing:true});
const filter=ref('upcoming');const trackTime=ref(false);const now=ref(Date.now());
const timer=setInterval(()=>{now.value=Date.now();},1000);onScopeDispose(()=>clearInterval(timer));
const fresh=computed(()=>state.data.value?.status==='ready'&&Date.parse(state.data.value.expiresAt!)>now.value);
const status=(weekend:Weekend)=>weekend.cancelled?'cancelled':Date.parse(weekend.endsAt)<now.value?'completed':Date.parse(weekend.startsAt)>now.value?'upcoming':'ongoing';
const list=computed(()=>fresh.value?state.data.value!.items.filter(item=>{
  if(props.meetingId)return item.id===props.meetingId;
  if(filter.value==='all')return true;
  if(filter.value==='upcoming')return ['upcoming','ongoing'].includes(status(item));
  return status(item)===filter.value;
}):[]);
const label=(english:string,chinese:string)=>locale.value==='zh-CN'?chinese||t('weekend.namePending'):english;
const title=(item:Weekend)=>label(item.name,item.nameZh);
const stamp=(value:string,item:Weekend)=>{
  const offset=item.gmtOffset.startsWith('-')?item.gmtOffset:'+'+item.gmtOffset;
  const sign=item.gmtOffset.startsWith('-')?-1:1;
  const parts=item.gmtOffset.replace('-','').split(':');
  const offsetMinutes=sign*(Number(parts[0])*60+Number(parts[1]));
  const date=trackTime.value?new Date(Date.parse(value)+offsetMinutes*60000):new Date(value);
  return new Intl.DateTimeFormat(locale.value,{month:'short',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit',timeZone:trackTime.value?'UTC':preferences.timeZone}).format(date)+(trackTime.value?' UTC'+offset.slice(0,6):'');
};
const related=(item:Weekend)=>news.data.value?.status==='ready'&&Date.parse(news.data.value.expiresAt!)>now.value?relatedNews(item,news.data.value.items):[];
const translatedTitle=(item:{title:string;titleZh:string|null})=>locale.value==='zh-CN'?item.titleZh||t('latest.translationUnavailable'):item.title;
</script>
<template><section class="weekend-calendar" data-testid="weekend-calendar"><div class="section-heading"><div><p class="eyebrow">2026 / {{state.data.value?.source|| (publicReference?'F1DB':'OpenF1')}}</p><h2>{{t('weekend.title')}}</h2></div><span class="timezone-tag">{{trackTime?t('races.trackTime'):preferences.timeZone}}</span></div><p class="muted">{{t(publicReference?'publicData.weekendDescription':'weekend.description')}}</p><div class="weekend-controls"><div v-if="!meetingId" class="filter-group" role="group" :aria-label="t('weekend.filter')"><button v-for="value in ['upcoming','all','completed','cancelled']" :key="value" :aria-pressed="filter===value" @click="filter=value">{{t('weekend.'+value)}}</button></div><div class="filter-group" role="group" :aria-label="t('races.timeDisplay')"><button :aria-pressed="!trackTime" @click="trackTime=false">{{t('races.yourTime')}}</button><button :aria-pressed="trackTime" @click="trackTime=true">{{t('races.trackTime')}}</button></div></div><ResourceState :focus-on-load="false" :loading="state.loading.value&&!state.data.value" :error="state.error.value" :retry-after="state.retryAfter.value" @retry="state.reload"><template v-if="state.data.value"><p v-if="!fresh" class="notice" role="status">{{t('weekend.'+(state.data.value.status==='ready'?'pending':state.data.value.status))}}</p><div v-else class="weekend-grid"><article v-for="item in list" :key="item.id" class="weekend-card"><div class="section-heading"><h3><RouterLink :to="'/weekends/'+item.id">{{title(item)}} ↗</RouterLink></h3><span class="badge">{{t('weekend.'+status(item))}}</span></div><div class="weekend-follow"><button type="button" :aria-pressed="preferences.followedWeekendIds.includes(item.id)" :aria-label="t(preferences.followedWeekendIds.includes(item.id)?'world.unfollowWeekendNamed':'world.followWeekendNamed',{name:title(item)})" @click="preferences.toggleWeekend(item.id)">{{t(preferences.followedWeekendIds.includes(item.id)?'world.followingWeekend':'world.followWeekend')}}</button></div><p class="weekend-dates"><time :datetime="item.startsAt">{{stamp(item.startsAt,item)}}</time> — <time :datetime="item.endsAt">{{stamp(item.endsAt,item)}}</time></p><CircuitMap :circuit="item.circuit"/><dl class="weekend-facts"><div><dt>{{t('weekend.circuit')}}</dt><dd>{{label(item.circuit,item.circuitZh)}}</dd></div><div><dt>{{t('weekend.location')}}</dt><dd>{{label(item.location,item.locationZh)}}</dd></div><div><dt>{{t('weekend.format')}}</dt><dd>{{t(item.sprint?'weekend.sprint':'weekend.standard')}}</dd></div></dl><details class="weekend-schedule" :open="!!meetingId||status(item)==='ongoing'"><summary>{{t('races.schedule')}} · {{item.sessions.length}} {{t('weekend.sessions')}}</summary><ol><li v-for="session in item.sessions" :key="session.id"><strong>{{t('weekend.session.'+session.kind)}}</strong><time :datetime="session.startsAt">{{stamp(session.startsAt,item)}}</time><span>— {{session.endEstimated?'≈ ':''}}{{stamp(session.endsAt,item)}}</span></li></ol><p v-if="!item.sessions.length" class="muted">{{t('weekend.noSessions')}}</p></details><div class="weekend-news"><h4>{{t('weekend.news')}}</h4><p class="caption">{{t('weekend.matching')}}</p><ul v-if="related(item).length"><li v-for="article in related(item)" :key="article.url"><a :href="newsHref(article.url)" target="_blank" rel="noopener noreferrer">{{translatedTitle(article)}} ↗</a><p v-if="locale==='zh-CN'?article.summaryZh:article.summary">{{locale==='zh-CN'?article.summaryZh:article.summary}}</p><span class="caption">{{news.data.value?.sourceName}} · {{t(article.translationStatus==='original'?'publicData.original':article.translationStatus==='edited'?'latest.edited':'latest.machine')}}</span></li></ul><p v-else class="caption">{{t(news.error.value?'weekend.newsUnavailable':'weekend.noNews')}}</p></div><p class="caption">{{state.data.value.source}} · {{t('weekend.reference')}}</p></article><p v-if="!list.length" class="empty-inline" role="status">{{t(meetingId?'weekend.notFound':'common.empty')}}</p></div><p v-if="fresh" class="caption">{{t('official.synced')}} {{new Date(state.data.value.syncedAt!).toLocaleString(locale)}} · <a :href="safeHref(state.data.value.sourceUrl)" :target="(safeHref(state.data.value.sourceUrl))?.startsWith('#/')?undefined:'_blank'" rel="noopener noreferrer">{{state.data.value.source}} ↗</a> · <a :href="safeHref(state.data.value.licenseUrl)" :target="(safeHref(state.data.value.licenseUrl))?.startsWith('#/')?undefined:'_blank'" rel="noopener noreferrer">{{state.data.value.license}} ↗</a></p></template></ResourceState></section></template>
