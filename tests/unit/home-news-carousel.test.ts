import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {mount,type VueWrapper} from '@vue/test-utils';
import {createI18n} from 'vue-i18n';
import {createMemoryHistory,createRouter} from 'vue-router';
import {defineComponent} from 'vue';
import HomeNewsCarousel from '../../apps/fan/src/components/HomeNewsCarousel.vue';
import {homeNewsSlides} from '../../apps/fan/src/lib/home-news-slides';
import type {NewsMedia,NewsMediaItem} from '../../apps/fan/src/api/newsroom';
import type {Weekends} from '../../apps/fan/src/api/weekends';

const NOW=Date.parse('2026-11-08T08:00:00Z');
const calendar=():Weekends=>({status:'ready',expiresAt:new Date(NOW+3600000).toISOString(),items:[
 {id:19,name:'Mexico City Grand Prix',startsAt:'2026-10-30T10:00:00Z',endsAt:'2026-11-01T22:00:00Z',cancelled:false},
 {id:20,name:'São Paulo Grand Prix',startsAt:'2026-11-06T10:00:00Z',endsAt:'2026-11-08T22:00:00Z',cancelled:false},
 {id:21,name:'Las Vegas Grand Prix',startsAt:'2026-11-20T10:00:00Z',endsAt:'2026-11-22T22:00:00Z',cancelled:false},
]} as unknown as Weekends);
const photo=(index:number,update:Partial<NewsMediaItem>={}):NewsMediaItem=>({id:index.toString(16).padStart(24,'0'),kind:'photo',title:'Sao Paulo Grand Prix: report '+index,titleZh:'圣保罗大奖赛：新闻 '+index,summary:'News from Interlagos.',url:'https://www.formula1.com/en/latest/article/report.'+index,imageUrl:'https://media.formula1.com/image/upload/test-'+index+'.jpg',publishedAt:null,updatedAt:new Date(NOW-index*60000).toISOString(),publisher:'Formula 1',credit:'Formula 1',...update});
const media=():NewsMedia=>({status:'ready',sourceName:'Formula 1',sourceUrl:'https://www.formula1.com/en/video',checkedAt:new Date(NOW).toISOString(),syncedAt:new Date(NOW).toISOString(),checkIntervalSeconds:600,photos:[photo(1),photo(2),photo(3)],videos:[],error:null});
let wrapper:VueWrapper|undefined,hidden=false,reduced=false;
const motionListeners=new Set<()=>void>();
beforeEach(()=>{
 vi.useFakeTimers();vi.setSystemTime(NOW);hidden=false;reduced=false;
 vi.spyOn(document,'visibilityState','get').mockImplementation(()=>hidden?'hidden':'visible');
 vi.stubGlobal('matchMedia',()=>({get matches(){return reduced;},addEventListener:(_name:string,listener:()=>void)=>motionListeners.add(listener),removeEventListener:(_name:string,listener:()=>void)=>motionListeners.delete(listener)}));
});
afterEach(()=>{wrapper?.unmount();wrapper=undefined;motionListeners.clear();vi.unstubAllGlobals();vi.useRealTimers();});
async function mounted(source=media()){
 const router=createRouter({history:createMemoryHistory(),routes:[{path:'/',component:defineComponent({template:'<div/>'})},{path:'/newsroom/:id',component:defineComponent({template:'<div/>'})}]});
 await router.push('/');await router.isReady();
 wrapper=mount(HomeNewsCarousel,{props:{media:source,calendar:calendar()},slots:{default:'<div data-testid="original-race-photo">Existing race photo</div>'},global:{plugins:[router,createI18n({legacy:false,locale:'zh-CN',messages:{}})]}});
 return {wrapper,router};
}

it('matches current-race news, excludes old/foreign/unsafe images and preserves true source dates',()=>{
 const source=media();source.photos.push(photo(4,{title:'Mexico City Grand Prix result',summary:'News from Mexico.',updatedAt:'2026-11-02T08:00:00Z'}),photo(5,{updatedAt:'2025-11-08T00:00:00Z'}),photo(6,{imageUrl:'https://media.formula1.com.evil.example/image.jpg'}),photo(7,{imageUrl:'https://media.formula1.com/image/upload/trackside-images/2025/photo.jpg'}));source.photos.unshift(photo(8,{title:'Sao Paulo betting predictions',updatedAt:new Date(NOW).toISOString()}));
 const slides=homeNewsSlides(calendar(),source,NOW);expect(slides.map(item=>item.id)).toEqual([photo(1).id,photo(2).id,photo(3).id]);expect(slides[0]!.publishedAt).toBeNull();expect(slides[0]!.sourceDate).toBe(photo(1).updatedAt);
 const expired=calendar();expired.expiresAt=new Date(NOW-1).toISOString();expect(homeNewsSlides(expired,source,NOW)).toEqual([]);
 const cancelled=calendar();cancelled.items[1]!.cancelled=true;expect(homeNewsSlides(cancelled,source,NOW).map(item=>item.id)).toEqual([photo(4).id]);
});

it('opens related internal articles and offers manual arrows, dots and a six-second rotation',async()=>{
 const {wrapper:w,router}=await mounted();expect(w.find('.hero-news-title').text()).toContain('圣保罗大奖赛：新闻 1');
 await vi.advanceTimersByTimeAsync(6000);expect(w.find('.hero-news-title').text()).toContain('新闻 2');
 await w.get('button[aria-label="下一条新闻图片"]').trigger('click');expect(w.find('.hero-news-title').text()).toContain('新闻 3');
 await w.get('button[aria-label="显示第 1 条新闻图片"]').trigger('click');expect(w.find('.hero-news-title').text()).toContain('新闻 1');
 await w.get('.hero-news-image').trigger('click');await vi.advanceTimersByTimeAsync(0);expect(router.currentRoute.value.path).toBe('/newsroom/'+media().photos[0]!.id);
});

it('pauses for hidden pages, focus, hover, reduced motion and explicit pause without losing manual control',async()=>{
 const {wrapper:w}=await mounted();const title=()=>w.find('.hero-news-title').text();
 hidden=true;document.dispatchEvent(new Event('visibilitychange'));await vi.advanceTimersByTimeAsync(6000);expect(title()).toContain('新闻 1');
 hidden=false;document.dispatchEvent(new Event('visibilitychange'));await w.get('section').trigger('focusin');await vi.advanceTimersByTimeAsync(6000);expect(title()).toContain('新闻 1');
 await w.get('section').trigger('focusout',{relatedTarget:null});await w.get('section').trigger('mouseenter');await vi.advanceTimersByTimeAsync(6000);expect(title()).toContain('新闻 1');
 await w.get('section').trigger('mouseleave');reduced=true;motionListeners.forEach(listener=>listener());await vi.advanceTimersByTimeAsync(6000);expect(title()).toContain('新闻 1');
 await w.get('button[aria-label="下一条新闻图片"]').trigger('click');expect(title()).toContain('新闻 2');
 reduced=false;motionListeners.forEach(listener=>listener());await w.vm.$nextTick();await w.get('button[aria-label="暂停新闻图片轮播"]').trigger('click');await vi.advanceTimersByTimeAsync(6000);expect(title()).toContain('新闻 2');
});

it('retains the existing race background if no news matches or every source image fails',async()=>{
 const source=media();source.photos=source.photos.map(item=>({...item,title:'Mexico City news',summary:'Mexico City Grand Prix.'}));
 const {wrapper:w}=await mounted(source);expect(w.find('[data-testid="original-race-photo"]').exists()).toBe(true);expect(w.find('.home-news-carousel').exists()).toBe(false);
 await w.setProps({media:media()});expect(w.find('.home-news-carousel').exists()).toBe(true);
 for(let index=0;index<3;index++)await w.get('img').trigger('error');expect(w.find('[data-testid="original-race-photo"]').exists()).toBe(true);expect(w.emitted('activeChange')?.at(-1)).toEqual([false]);
});
