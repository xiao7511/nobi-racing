<script setup lang="ts">
import {computed,ref,watch,onMounted,onScopeDispose} from 'vue';
import {useI18n} from 'vue-i18n';
import type {NewsMedia} from '../api/newsroom';
import type {Weekends} from '../api/weekends';
import {homeNewsSlides,type HomeNewsSlide} from '../lib/home-news-slides';

const props=defineProps<{media?:NewsMedia;calendar?:Weekends|null}>();
const emit=defineEmits<{activeChange:[active:boolean]}>();
const {locale}=useI18n(),zh=computed(()=>locale.value==='zh-CN');
const text=(cn:string,en:string)=>zh.value?cn:en;
const now=ref(Date.now()),selectedId=ref(''),paused=ref(false),hovered=ref(false),focused=ref(false),hidden=ref(false),reducedMotion=ref(false);
const failed=ref(new Set<string>());
const slides=computed(()=>homeNewsSlides(props.calendar,props.media,now.value).filter(item=>!failed.value.has(item.id+':'+item.imageUrl)));
const current=computed(()=>slides.value.find(item=>item.id===selectedId.value)||slides.value[0]);
const index=computed(()=>Math.max(0,slides.value.findIndex(item=>item.id===current.value?.id)));
const title=(item:HomeNewsSlide)=>zh.value?(item.titleZh||(item.translation==='unavailable'?'本站最新新闻 · 中文译文暂不可用':'本站最新新闻 · 中文标题翻译中')):item.title;
const stamp=(item:HomeNewsSlide)=>new Date(item.sourceDate).toLocaleDateString(locale.value,{month:'short',day:'numeric'});
function move(direction:number){if(slides.value.length)selectedId.value=slides.value[(index.value+direction+slides.value.length)%slides.value.length]!.id;}
function imageFailed(item:HomeNewsSlide){failed.value=new Set([...failed.value,item.id+':'+item.imageUrl]);}
function focusOut(event:FocusEvent){if(!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node|null))focused.value=false;}
watch(slides,next=>{if(!next.some(item=>item.id===selectedId.value))selectedId.value=next[0]?.id||'';emit('activeChange',!!next.length);},{immediate:true});
let timer:ReturnType<typeof setInterval>|undefined,motion:MediaQueryList|undefined;
const visibility=()=>{hidden.value=document.visibilityState!=='visible';now.value=Date.now();};
const motionChanged=()=>{reducedMotion.value=motion?.matches||false;};
onMounted(()=>{
 visibility();motion=window.matchMedia?.('(prefers-reduced-motion: reduce)');motionChanged();motion?.addEventListener('change',motionChanged);document.addEventListener('visibilitychange',visibility);
 timer=setInterval(()=>{now.value=Date.now();if(!paused.value&&!hovered.value&&!focused.value&&!hidden.value&&!reducedMotion.value&&slides.value.length>1)move(1);},6000);
});
onScopeDispose(()=>{clearInterval(timer);document.removeEventListener('visibilitychange',visibility);motion?.removeEventListener('change',motionChanged);});
</script>
<template>
 <section v-if="current" class="home-news-carousel" role="region" aria-roledescription="carousel" :aria-label="text('最新分站新闻图片轮播','Latest race news photo carousel')" data-swipe-ignore @mouseenter="hovered=true" @mouseleave="hovered=false" @focusin="focused=true" @focusout="focusOut">
  <RouterLink class="hero-news-image" :to="'/newsroom/'+current.id" :aria-label="text('阅读相关新闻：','Read related news: ')+title(current)"><img :key="current.id" :src="current.imageUrl" :alt="title(current)" width="1920" height="1080" decoding="async" referrerpolicy="no-referrer" @error="imageFailed(current)"/></RouterLink>
  <div class="hero-news-shade" aria-hidden="true"/>
  <div class="hero-news-footer">
   <div class="hero-news-caption" :aria-live="paused||focused?'polite':'off'">
    <span class="hero-news-source">{{text('F1 官方图片新闻','Official F1 photo news')}} · {{stamp(current)}}<template v-if="current.credit"> · {{current.credit}}</template></span>
    <RouterLink :to="'/newsroom/'+current.id" class="hero-news-title">{{title(current)}} <span aria-hidden="true">→</span></RouterLink>
   </div>
   <div v-if="slides.length>1" class="hero-news-controls" :aria-label="text('图片轮播控制','Photo carousel controls')">
    <button type="button" :aria-label="text('上一条新闻图片','Previous news photo')" @click="move(-1)">←</button>
    <div class="hero-news-dots"><button v-for="(item,i) in slides" :key="item.id" type="button" :class="{active:item.id===current.id}" :aria-label="text('显示第 '+(i+1)+' 条新闻图片','Show news photo '+(i+1))" :aria-pressed="item.id===current.id" @click="selectedId=item.id"><span/></button></div>
    <button v-if="!reducedMotion" type="button" :aria-label="paused?text('播放新闻图片轮播','Play news photo carousel'):text('暂停新闻图片轮播','Pause news photo carousel')" :aria-pressed="paused" @click="paused=!paused">{{paused?'▶':'Ⅱ'}}</button>
    <button type="button" :aria-label="text('下一条新闻图片','Next news photo')" @click="move(1)">→</button>
   </div>
  </div>
 </section>
 <slot v-else/>
</template>
<style scoped>
.home-news-carousel{position:absolute;inset:0;color:#fff;background:#10141b}.hero-news-image,.hero-news-shade{position:absolute;inset:0}.hero-news-image img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 40%}.hero-news-shade{pointer-events:none;background:linear-gradient(90deg,rgba(5,9,15,.92),rgba(5,9,15,.4) 55%,rgba(5,9,15,.1)),linear-gradient(0deg,rgba(5,9,15,.84),transparent 60%)}.hero-news-footer{position:absolute;z-index:3;left:0;right:0;bottom:0;display:flex;align-items:end;gap:20px;padding:20px 28px;background:linear-gradient(0deg,rgba(0,0,0,.68),transparent)}.hero-news-caption{flex:1;min-width:0;display:grid;gap:8px}.hero-news-source{font-size:11px;line-height:1.6;color:#e2e8ef;overflow-wrap:anywhere}.hero-news-title{font-size:17px;font-weight:700;line-height:1.5;overflow-wrap:anywhere}.hero-news-controls{display:flex;align-items:center;gap:4px;flex-shrink:0}.hero-news-controls button{display:grid;place-items:center;min-width:40px;height:44px;padding:4px;border:1px solid #fff5;border-radius:5px;color:#fff;background:#10141b99;cursor:pointer}.hero-news-dots{display:flex;gap:0}.hero-news-dots button{min-width:24px;width:24px;border:0;background:none}.hero-news-dots span{display:block;width:6px;height:6px;border-radius:50%;background:#fff7}.hero-news-dots .active span{width:16px;border-radius:4px;background:#fff}.hero-news-image:focus-visible{outline:3px solid var(--color-focus);outline-offset:-5px}.hero-news-title:focus-visible,.hero-news-controls button:focus-visible{outline:3px solid var(--color-focus);outline-offset:3px}
@media(max-width:760px){.hero-news-footer{display:grid;gap:10px;padding:16px 20px}.hero-news-title{font-size:15px}.hero-news-source{font-size:10px}.hero-news-controls{justify-content:flex-end}.hero-news-image img{object-position:65% center}.hero-news-shade{background:linear-gradient(180deg,rgba(5,9,15,.88),rgba(5,9,15,.27) 60%,rgba(5,9,15,.8))}}
</style>
