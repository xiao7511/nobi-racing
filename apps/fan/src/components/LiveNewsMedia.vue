<script setup lang="ts">
import {computed,ref,watch,nextTick,onScopeDispose} from 'vue';
import {useI18n} from 'vue-i18n';
import type {NewsMedia,NewsMediaItem} from '../api/newsroom';
import {safeHref} from '../lib/navigation-links';
const props=defineProps<{media?:NewsMedia;mode:'photos'|'videos'}>();
const {locale}=useI18n(),zh=computed(()=>locale.value==='zh-CN');
const text=(cn:string,en:string)=>zh.value?cn:en;
const title=(item:NewsMediaItem)=>zh.value?(item.titleZh||'中文标题翻译中'):item.title;
const items=computed(()=>props.media?.[props.mode]||[]);
const stamp=(at:string|null|undefined)=>at?new Date(at).toLocaleString(locale.value):text('等待首次同步','Awaiting first sync');
const selectedId=ref(''),failed=ref(false),waiting=ref(false),failedImages=ref(new Set<string>());
const player=ref<HTMLElement|null>(null);
let timer:ReturnType<typeof setTimeout>|undefined;
const selected=computed(()=>items.value.find(item=>item.id===selectedId.value));
const embed=computed(()=>{
 try{const url=new URL(selected.value?.embedUrl||'');return url.origin==='https://players.brightcove.net'&&url.pathname==='/6057949432001/FC1Xxg8gIw_default/index.html'&&/^\d{10,24}$/.test(url.searchParams.get('videoId')||'')?url.href:null;}catch{return null;}
});
function stop(){clearTimeout(timer);selectedId.value='';waiting.value=false;failed.value=false;}
function play(item:NewsMediaItem){stop();selectedId.value=item.id;waiting.value=true;timer=setTimeout(()=>{waiting.value=false;failed.value=true;},25000);void nextTick(()=>{player.value?.scrollIntoView?.({behavior:'smooth',block:'start'});player.value?.focus({preventScroll:true});});}
function loaded(){clearTimeout(timer);waiting.value=false;}
function imageFailed(id:string){failedImages.value=new Set([...failedImages.value,id]);}
watch(()=>props.mode,stop);watch(items,next=>{if(selectedId.value&&!next.some(item=>item.id===selectedId.value))stop();});onScopeDispose(()=>clearTimeout(timer));
</script>
<template>
 <section class="newsroom-live-media" :lang="locale">
  <h2>{{mode==='photos'?text('最新图片新闻','Latest photo news'):text('最新视频新闻','Latest video news')}}</h2>
  <p class="caption">{{text('F1 官方动态 · 最近同步：','Official F1 updates · Last synced: ')}}{{stamp(media?.syncedAt)}} · {{text('每 ','Checked every ')}}{{Math.round((media?.checkIntervalSeconds||600)/60)}}{{text(' 分钟自动检查',' minutes')}}</p>
  <p v-if="media?.status==='delayed'||media?.status==='unavailable'" class="notice" role="status">{{text('官方媒体源暂有延迟，恢复后自动同步。下列内容保留原发布时间。','The official media source is delayed and will retry automatically. Publication times are retained.')}}</p>
  <div v-if="items.length" class="newsroom-grid">
   <article v-for="item in items" :key="item.id" class="newsroom-card newsroom-media-card">
    <RouterLink v-if="item.imageUrl&&!failedImages.has(item.id)" :to="'/newsroom/'+item.id" :aria-label="title(item)"><img :src="item.imageUrl" :alt="title(item)" loading="lazy" width="640" height="360" referrerpolicy="no-referrer" @error="imageFailed(item.id)"/></RouterLink>
    <p class="eyebrow">{{text('F1 官方','Formula 1')}} · {{item.kind==='video'?text('视频新闻','Video news'):text('图片新闻','Photo news')}}<template v-if="zh&&item.titleZh"> · 机器翻译</template></p>
    <h3><RouterLink :to="'/newsroom/'+item.id">{{title(item)}}</RouterLink></h3>
    <p v-if="zh?item.summaryZh:item.summary">{{zh?item.summaryZh:item.summary}}</p>
    <p class="caption">{{item.publishedAt?text('发布：','Published: '):text('来源更新：','Source updated: ')}}{{stamp(item.publishedAt||item.updatedAt)}}<template v-if="item.credit"> · {{item.credit}}</template></p>
    <button v-if="mode==='videos'&&item.embedUrl" class="button" @click="play(item)">{{text('站内播放','Play here')}} ▶</button>
    <a :href="safeHref(item.url)" target="_blank" rel="noopener noreferrer">{{text('查看官方报道','Official report')}} ↗</a>
   </article>
  </div>
  <p v-else class="empty-inline" role="status">{{text('正在同步官方最新内容，稍后将自动显示。','Synchronizing the latest official content. New items will appear automatically.')}}</p>
  <section v-if="mode==='videos'&&selected" ref="player" class="newsroom-video newsroom-live-player" tabindex="-1" aria-live="polite">
   <div class="section-heading"><h3>{{title(selected)}}</h3><button class="button" @click="stop">{{text('关闭播放器','Close player')}}</button></div>
   <p v-if="waiting" role="status">{{text('正在连接官方播放器…','Connecting to the official player…')}}</p>
   <iframe v-if="embed&&!failed" :key="embed" class="newsroom-player" :src="embed" :title="title(selected)" allow="encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" @load="loaded" @error="failed=true;loaded()"/>
   <p v-if="failed||!embed" class="notice" role="alert">{{text('官方播放器暂时无法连接，可重试或查看官方报道。','The official player could not connect. Retry or open the official report.')}} <button class="button" @click="play(selected)">{{text('重试播放','Retry player')}}</button></p>
   <p class="caption">{{text('视频通过 F1 官方播放器嵌入，播放取决于来源的网络与地区可用性。','Embedded with the official F1 player; availability depends on the source and region.')}} <a :href="safeHref(selected.url)" target="_blank" rel="noopener noreferrer">{{text('官方视频原页','Official video page')}} ↗</a></p>
  </section>
 </section>
</template>
