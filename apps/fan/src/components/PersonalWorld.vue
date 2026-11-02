<script setup lang="ts">
import {safeHref} from '../lib/navigation-links';
import {computed,onScopeDispose,ref} from 'vue';
import {usePage} from '../composables/usePage';
import {useResource} from '../composables/useResource';
import {seasonInsights} from '../api/season-insights';
import {weekends,type Weekend} from '../api/weekends';
import {latestNews} from '../api/latest-news';
import {page,isUuid} from '../api/client';
import {mockApi} from '../api/mock-api';
import {isOpenDriverId} from '../lib/preferences';
import {publicReference} from '../lib/urls';
import {isPublicNewsUrl} from '../lib/news-links';
import {newsBookmarkKey} from '../lib/news-links';
import names from '../content/stats-names.json';
import NewsCard from './NewsCard.vue';
const {t,locale,preferences,date}=usePage();
const now=ref(Date.now());const timer=setInterval(()=>{now.value=Date.now();},1000);onScopeDispose(()=>clearInterval(timer));
const insights=useResource(seasonInsights,[],{volatile:true,refreshMs:60000,preserveWhileRefreshing:true});
const calendar=useResource(weekends,[],{volatile:true,refreshMs:60000,preserveWhileRefreshing:true});
const news=useResource(latestNews,[],{volatile:true,refreshMs:60000,preserveWhileRefreshing:true});
const freshInsights=computed(()=>insights.data.value?.status==='ready'&&Date.parse(insights.data.value.expiresAt!)>now.value);
const freshCalendar=computed(()=>calendar.data.value?.status==='ready'&&Date.parse(calendar.data.value.expiresAt!)>now.value);
const freshNews=computed(()=>news.data.value?.status==='ready'&&Date.parse(news.data.value.expiresAt!)>now.value);
const snapshot=computed(()=>freshInsights.value?insights.data.value!.rounds.at(-1):null);
const sourceWeekends=computed(()=>freshCalendar.value?calendar.data.value!.items:[]);
const sourceNews=computed(()=>freshNews.value?news.data.value!.items:[]);
const legacyIds=computed(()=>preferences.followedDriverIds.filter(id=>!isOpenDriverId(id)));
const legacy=useResource(async signal=>legacyIds.value.some(isUuid)?(await page('/api/v1/drivers',{}, {signal,locale:locale.value})).items:[],[()=>legacyIds.value.join(','),()=>locale.value],{volatile:true});
const originals=useResource(async signal=>preferences.savedArticleIds.length?(await mockApi.articles({signal})).data:[],[()=>preferences.savedArticleIds.join(',')]);
const label=(name:string)=>locale.value==='zh-CN'&&Object.hasOwn(names,name)?names[name as keyof typeof names]:name;
const weekendName=(item:Weekend)=>locale.value==='zh-CN'?item.nameZh||item.name:item.name;
const filter=ref('all');const show=(value:string)=>filter.value==='all'||filter.value===value;
const drivers=computed(()=>preferences.followedDriverIds.filter(isOpenDriverId).slice().reverse().map(key=>({key,id:key.slice('openf1:driver:'.length),row:snapshot.value?.drivers.find(row=>'openf1:driver:'+row.id===key)})));
const teams=computed(()=>preferences.followedTeamIds.slice().reverse().map(key=>({key,id:key.slice('openf1:team:'.length),row:snapshot.value?.teams.find(row=>'openf1:team:'+row.id===key)})));
const meetings=computed(()=>preferences.followedWeekendIds.slice().reverse().map(id=>({id,item:sourceWeekends.value.find(item=>item.id===id)})));
const bookmarks=computed(()=>preferences.savedNewsUrls.slice().reverse().map(url=>({url,item:sourceNews.value.find(item=>newsBookmarkKey(item.url)===url)})));
const savedOriginals=computed(()=>originals.data.value?.filter(item=>preferences.savedArticleIds.includes(item.id))||[]);
const total=computed(()=>preferences.followedDriverIds.length+teams.value.length+meetings.value.length+bookmarks.value.length+preferences.savedArticleIds.length);
const nextWeekend=computed(()=>meetings.value.flatMap(row=>row.item&&!row.item.cancelled&&Date.parse(row.item.endsAt)>now.value?[row.item]:[]).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt))[0]);
const nextSession=computed(()=>nextWeekend.value?.sessions.find(session=>Date.parse(session.endsAt)>now.value));
const status=(item:Weekend)=>item.cancelled?'cancelled':Date.parse(item.endsAt)<now.value?'completed':Date.parse(item.startsAt)>now.value?'upcoming':'ongoing';
const headline=(item:NonNullable<typeof bookmarks.value[number]['item']>)=>locale.value==='zh-CN'?item.titleZh||t('latest.translationUnavailable'):item.title;
const availableDrivers=computed(()=>snapshot.value?.drivers.filter(row=>!preferences.followedDriverIds.includes('openf1:driver:'+row.id))||[]);
const availableTeams=computed(()=>snapshot.value?.teams.filter(row=>!preferences.followedTeamIds.includes('openf1:team:'+row.id))||[]);
const availableWeekends=computed(()=>sourceWeekends.value.filter(item=>!item.cancelled&&Date.parse(item.endsAt)>now.value&&!preferences.followedWeekendIds.includes(item.id)));
const chosenDriver=ref(''),chosenTeam=ref(''),chosenWeekend=ref('');
const driverChoice=computed(()=>availableDrivers.value.find(row=>row.id===chosenDriver.value)||availableDrivers.value[0]);
const teamChoice=computed(()=>availableTeams.value.find(row=>row.id===chosenTeam.value)||availableTeams.value[0]);
const weekendChoice=computed(()=>availableWeekends.value.find(item=>String(item.id)===chosenWeekend.value)||availableWeekends.value[0]);
const publisher=(url:string)=>isPublicNewsUrl(url)?'NOBI Racing / F1DB':'BBC Sport';
const number=(value:string)=>new Intl.NumberFormat(locale.value,{maximumFractionDigits:3}).format(Number(value));
const bookmarkPath=(url:string)=>new URL(url).pathname;
const refreshing=computed(()=>insights.loading.value||calendar.loading.value||news.loading.value);
function reload(){void insights.reload();void calendar.reload();void news.reload();void legacy.reload();}
</script>
<template>
  <div class="personal-world" data-testid="personal-world">
    <section class="world-intro"><span class="avatar" aria-hidden="true">NR</span><div><p class="eyebrow">{{t('world.localFan')}}</p><h2>{{t(total?'world.welcomeBack':'world.welcome')}}</h2><p>{{t('world.intro')}}</p></div><button class="button" :disabled="refreshing" @click="reload">{{t(refreshing?'world.refreshing':'world.refresh')}}</button></section>
    <dl class="world-counts"><div><dt>{{t('world.drivers')}}</dt><dd>{{preferences.followedDriverIds.length}}</dd></div><div><dt>{{t('world.teams')}}</dt><dd>{{teams.length}}</dd></div><div><dt>{{t('world.weekends')}}</dt><dd>{{meetings.length}}</dd></div><div><dt>{{t('world.news')}}</dt><dd>{{bookmarks.length+preferences.savedArticleIds.length}}</dd></div></dl>
    <aside v-if="nextWeekend" class="world-next"><div><p class="eyebrow">{{t('world.nextFollowed')}}</p><h2>{{weekendName(nextWeekend)}}</h2><p v-if="nextSession">{{t('weekend.session.'+nextSession.kind)}} · {{date(nextSession.startsAt)}} <span class="badge">{{t(Date.parse(nextSession.startsAt)<=now?'world.scheduledNow':'world.scheduledNext')}}</span></p><p v-else>{{date(nextWeekend.startsAt)}} — {{date(nextWeekend.endsAt)}}</p></div><RouterLink class="button" :to="'/weekends/'+nextWeekend.id">{{t('world.viewSchedule')}} ↗</RouterLink></aside>
    <div class="world-filters filter-group" role="group" :aria-label="t('world.filter')"><button v-for="value in ['all','drivers','teams','weekends','news']" :key="value" :aria-pressed="filter===value" @click="filter=value">{{t('world.'+value)}}</button></div>
    <section v-if="show('drivers')" class="world-section" data-testid="world-drivers">
      <div class="section-heading"><h2>{{t('world.followedDrivers')}}</h2><RouterLink to="/stats?type=driver">{{t('world.exploreStandings')}} ↗</RouterLink></div>
      <div v-if="availableDrivers.length" class="world-add"><label>{{t('world.chooseDriver')}}<select :aria-label="t('world.chooseDriver')" :value="driverChoice?.id" @change="chosenDriver=($event.target as HTMLSelectElement).value"><option v-for="row in availableDrivers" :key="row.id" :value="row.id">{{label(row.name)}} · #{{row.id}}</option></select></label><button class="button" @click="driverChoice&&preferences.toggleFollowed('openf1:driver:'+driverChoice.id)">{{t('world.addDriver')}}</button></div>
      <p v-if="!freshInsights" class="notice" role="status">{{t(insights.loading.value?'world.sourceLoading':'world.sourceUnavailable')}}</p>
      <div v-if="drivers.length" class="world-grid"><article v-for="driver in drivers" :key="driver.key" class="world-card"><span class="world-car-number">#{{driver.id}}</span><h3>{{driver.row?label(driver.row.name):t('world.driverIdentifier',{id:driver.id})}}</h3><template v-if="driver.row"><p class="muted">{{driver.row.team?label(driver.row.team):t('insights.teamUnavailable')}}</p><p class="world-card-facts">P{{driver.row.position}} <strong>{{number(driver.row.points)}} {{t('stats.points')}}</strong></p><RouterLink :to="{path:'/stats',query:{type:'driver',q:driver.row.name}}">{{t('world.viewStandings')}} ↗</RouterLink></template><p v-else class="caption">{{t('world.unavailableSelection')}}</p><button type="button" class="world-remove" :aria-label="t('world.unfollowNamed',{name:driver.row?label(driver.row.name):'#'+driver.id})" @click="preferences.toggleFollowed(driver.key)">{{t('world.unfollow')}}</button></article></div>
      <div v-else class="world-empty"><p>{{t('world.noDrivers')}}</p><RouterLink to="/stats?type=driver">{{t('world.exploreStandings')}} →</RouterLink></div>
      <p v-if="snapshot&&drivers.some(driver=>driver.row)" class="caption world-source">{{insights.data.value?.source}} · {{t('world.pointsAsOf',{date:date(snapshot.endsAt)})}}</p>
      <details v-if="legacyIds.length" class="world-legacy" open><summary>{{t('world.legacyFollows')}}</summary><div class="world-grid"><article v-for="id in legacyIds" :key="id" class="world-card"><template v-if="legacy.data.value?.find(driver=>driver.id===id)"><RouterLink :to="'/drivers/'+id">{{legacy.data.value.find(driver=>driver.id===id)!.name}} ↗</RouterLink><p class="caption">MOCK · {{t('common.synthetic')}}</p></template><p v-else>{{t('world.legacyUnavailable')}}</p><button :aria-label="t('world.removeLegacy',{id})" @click="preferences.toggleFollowed(id)">{{t('world.unfollow')}}</button></article></div></details>
    </section>
    <section v-if="show('teams')" class="world-section" data-testid="world-teams">
      <div class="section-heading"><h2>{{t('world.followedTeams')}}</h2><RouterLink to="/stats?type=team">{{t('world.exploreTeams')}} ↗</RouterLink></div>
      <div v-if="availableTeams.length" class="world-add"><label>{{t('world.chooseTeam')}}<select :aria-label="t('world.chooseTeam')" :value="teamChoice?.id" @change="chosenTeam=($event.target as HTMLSelectElement).value"><option v-for="row in availableTeams" :key="row.id" :value="row.id">{{label(row.name)}}</option></select></label><button class="button" @click="teamChoice&&preferences.toggleTeam('openf1:team:'+teamChoice.id)">{{t('world.addTeam')}}</button></div>
      <p v-if="!freshInsights" class="notice" role="status">{{t(insights.loading.value?'world.sourceLoading':'world.sourceUnavailable')}}</p>
      <div v-if="teams.length" class="world-grid"><article v-for="team in teams" :key="team.key" class="world-card"><p class="eyebrow">{{t('world.team')}}</p><h3>{{label(team.row?.name||team.id)}}</h3><template v-if="team.row"><p class="world-card-facts">P{{team.row.position}} <strong>{{number(team.row.points)}} {{t('stats.points')}}</strong></p><RouterLink :to="{path:'/stats',query:{type:'team',q:team.row.name}}">{{t('world.viewStandings')}} ↗</RouterLink></template><p v-else class="caption">{{t('world.unavailableSelection')}}</p><button class="world-remove" :aria-label="t('world.unfollowNamed',{name:label(team.id)})" @click="preferences.toggleTeam(team.key)">{{t('world.unfollow')}}</button></article></div>
      <div v-else class="world-empty"><p>{{t('world.noTeams')}}</p><RouterLink to="/stats?type=team">{{t('world.exploreTeams')}} →</RouterLink></div>
    </section>
    <section v-if="show('weekends')" class="world-section" data-testid="world-weekends">
      <div class="section-heading"><h2>{{t('world.followedWeekends')}}</h2><RouterLink to="/races">{{t('world.exploreWeekends')}} ↗</RouterLink></div>
      <div v-if="availableWeekends.length" class="world-add"><label>{{t('world.chooseWeekend')}}<select :aria-label="t('world.chooseWeekend')" :value="String(weekendChoice?.id||'')" @change="chosenWeekend=($event.target as HTMLSelectElement).value"><option v-for="item in availableWeekends" :key="item.id" :value="String(item.id)">{{weekendName(item)}}</option></select></label><button class="button" @click="weekendChoice&&preferences.toggleWeekend(weekendChoice.id)">{{t('world.addWeekend')}}</button></div>
      <p v-if="!freshCalendar" class="notice" role="status">{{t(calendar.loading.value?'world.sourceLoading':'world.sourceUnavailable')}}</p>
      <div v-if="meetings.length" class="world-grid"><article v-for="meeting in meetings" :key="meeting.id" class="world-card"><template v-if="meeting.item"><span class="badge">{{t('weekend.'+status(meeting.item))}}</span><h3>{{weekendName(meeting.item)}}</h3><p class="world-dates">{{date(meeting.item.startsAt)}} — {{date(meeting.item.endsAt)}}</p><RouterLink :to="'/weekends/'+meeting.id">{{t('world.viewSchedule')}} ↗</RouterLink></template><template v-else><h3>{{t('world.weekendIdentifier',{id:meeting.id})}}</h3><p class="caption">{{t('world.unavailableSelection')}}</p></template><button class="world-remove" :aria-label="t('world.unfollowWeekendNamed',{name:meeting.item?weekendName(meeting.item):String(meeting.id)})" @click="preferences.toggleWeekend(meeting.id)">{{t('world.unfollow')}}</button></article></div>
      <div v-else class="world-empty"><p>{{t('world.noWeekends')}}</p><RouterLink to="/races">{{t('world.exploreWeekends')}} →</RouterLink></div>
      <p v-if="meetings.length&&freshCalendar" class="caption world-source">{{calendar.data.value?.source}} · {{t('weekend.reference')}} · {{preferences.timeZone}}</p>
    </section>
    <section v-if="show('news')" class="world-section" data-testid="world-news">
      <div class="section-heading"><h2>{{t('world.savedNews')}}</h2><RouterLink to="/news">{{t('profile.exploreNews')}} ↗</RouterLink></div>
      <p v-if="bookmarks.length&&!freshNews" class="notice" role="status">{{t(news.loading.value?'world.sourceLoading':'world.newsUnavailable')}}</p>
      <div v-if="bookmarks.length" class="world-bookmarks"><article v-for="bookmark in bookmarks" :key="bookmark.url" class="world-bookmark"><div><p class="eyebrow">{{publisher(bookmark.url)}} / {{t('world.originalLink')}}</p><h3><a :href="safeHref(bookmark.url.startsWith('https://github.com/f1db/')?'#/brief?source='+encodeURIComponent(bookmark.url):bookmark.url)" :target="bookmark.url.startsWith('https://github.com/f1db/')?undefined:'_blank'" rel="noopener noreferrer">{{bookmark.item?headline(bookmark.item):t('world.bookmarkUnavailable',{publisher:publisher(bookmark.url)})}} ↗</a></h3><p v-if="bookmark.item?.publishedAt" class="caption">{{date(bookmark.item.publishedAt)}}</p><p v-if="!bookmark.item" class="caption">{{t('world.linkRetained')}} <span class="world-url">{{bookmarkPath(bookmark.url)}}</span></p><p v-else class="caption">{{t(bookmark.item.translationStatus==='original'?'publicData.original':bookmark.item.translationStatus==='edited'?'latest.edited':bookmark.item.translationStatus==='machine'?'latest.machine':'latest.summaryOnly')}}</p></div><button :aria-label="t('world.unsaveNamed',{title:bookmark.item?headline(bookmark.item):bookmarkPath(bookmark.url)})" @click="preferences.toggleNews(bookmark.url)">{{t('world.removeBookmark')}}</button></article></div>
      <div v-else class="world-empty"><p>{{t('world.noNews')}}</p><RouterLink to="/news">{{t('profile.exploreNews')}} →</RouterLink></div>
      <details v-if="preferences.savedArticleIds.length" class="world-legacy" open><summary>{{t('world.legacySaved')}}</summary><div v-if="savedOriginals.length" class="news-grid"><NewsCard v-for="article in savedOriginals" :key="article.id" :article="article"/></div><div class="world-legacy-remove"><button v-for="id in preferences.savedArticleIds" :key="id" @click="preferences.toggleSaved(id)">{{t('world.removeOriginal',{id})}}</button></div></details>
      <p class="caption world-source">{{t('world.bookmarkPolicy')}} <a :href="safeHref(publicReference?'https://creativecommons.org/licenses/by/4.0/':'https://www.bbc.co.uk/usingthebbc/terms-of-use/#15metadataandrssfeeds')" :target="(safeHref(publicReference?'https://creativecommons.org/licenses/by/4.0/':'https://www.bbc.co.uk/usingthebbc/terms-of-use/#15metadataandrssfeeds'))?.startsWith('#/')?undefined:'_blank'" rel="noopener noreferrer">{{t('latest.terms')}} ↗</a></p>
    </section>
    <p v-if="freshInsights||freshCalendar" class="caption world-source"><a :href="safeHref(publicReference?'https://github.com/f1db/f1db':'https://openf1.org/')" :target="(safeHref(publicReference?'https://github.com/f1db/f1db':'https://openf1.org/'))?.startsWith('#/')?undefined:'_blank'" rel="noopener noreferrer">{{publicReference?'F1DB':'OpenF1'}} ↗</a> · <a :href="safeHref(publicReference?'https://creativecommons.org/licenses/by/4.0/':'https://creativecommons.org/licenses/by-nc-sa/4.0/')" :target="(safeHref(publicReference?'https://creativecommons.org/licenses/by/4.0/':'https://creativecommons.org/licenses/by-nc-sa/4.0/'))?.startsWith('#/')?undefined:'_blank'" rel="noopener noreferrer">{{publicReference?'CC BY 4.0':'CC BY-NC-SA 4.0'}} ↗</a> · {{t('weekend.reference')}}<span v-if="snapshot"> · {{t('world.pointsAsOf',{date:date(snapshot.endsAt)})}}</span></p>
    <section class="world-preferences"><div><h2>{{t('world.preferences')}}</h2><p>{{preferences.locale==='zh-CN'?'简体中文':'English'}} · {{t('settings.'+preferences.theme)}} · {{preferences.timeZone}}</p><p class="caption">{{t('world.privacy')}}</p></div><RouterLink class="button" to="/settings">{{t('world.manage')}} ↗</RouterLink></section>
  </div>
</template>
