import type {Router} from 'vue-router';
import {Capacitor} from '@capacitor/core';

/** Stable section order. Item readers are reached only from real links/history. */
export const pageRouteOrder=['/','/news','/newsroom','/races','/stats','/profile','/forum','/settings','/sources','/legal'] as const;
export type PageDirection='previous'|'next';
export interface PageDestination{to:string;action:'push'|'replace'|'back'|'forward'}
const detail=/^\/(newsroom|news|races|weekends|drivers|teams)\/[^/?#]+$/;
const knownLocation=(value:unknown):value is string=>{
 if(typeof value!=='string'||value.length>2000||!value.startsWith('/')||value.startsWith('//')||value.includes('\\')||[...value].some(character=>character.charCodeAt(0)<32))return false;
 try{const url=new URL(value,'https://nobi.invalid');return url.origin==='https://nobi.invalid'&&(pageRouteOrder.some(path=>path===url.pathname)||url.pathname==='/brief'||detail.test(url.pathname));}catch{return false;}
};
function category(path:string){
 if(path==='/brief'||path.startsWith('/news/'))return '/news';
 if(path.startsWith('/newsroom/'))return '/newsroom';
 if(/^\/(races|weekends)\//.test(path))return '/races';
 if(/^\/(drivers|teams)\//.test(path))return '/stats';
 return pageRouteOrder.find(value=>value===path)||'/';
}
export function pageDestinations(router:Router,state:Record<string,unknown>|null=window.history.state):{previous:PageDestination;next:PageDestination}{
 const current=router.currentRoute.value,path=current.path,parent=category(path),index=pageRouteOrder.indexOf(parent);
 const previous:PageDestination={to:pageRouteOrder[(index-1+pageRouteOrder.length)%pageRouteOrder.length]!,action:'push'};
 const next:PageDestination={to:pageRouteOrder[(index+1)%pageRouteOrder.length]!,action:'push'};
 const nested=path!==parent||path==='/forum'&&!!current.query.topic;
 if(nested){
  previous.to=parent;previous.action='replace';
  if(knownLocation(state?.back)&&state.back!==(current.fullPath||path)){previous.to=state.back;previous.action='back';}
  if(knownLocation(state?.forward)&&state.forward!==(current.fullPath||path)){next.to=state.forward;next.action='forward';}
 }
 return {previous,next};
}
export function navigatePage(router:Router,direction:PageDirection){
 const destination=pageDestinations(router)[direction];
 document.documentElement.dataset.navigation=direction==='previous'?'back':'forward';
 if(destination.action==='back')router.back();
 else if(destination.action==='forward')router.forward();
 else void router[destination.action](destination.to);
}
/** Native Back keeps history semantics rather than cycling through sections. */
export function previousPage(router:Router){
 document.documentElement.dataset.navigation='back';
 const back=window.history.state?.back,current=router.currentRoute.value;
 if(knownLocation(back)&&back!==(current.fullPath||current.path)){router.back();return;}
 const parent=category(current.path);
 if(current.path!==parent||current.path==='/forum'&&current.query.topic)void router.replace(parent);
 else if(current.path!=='/')void router.replace('/');
}

const interactive='a,button,input,textarea,select,label,form,video,audio,iframe,canvas,svg,dialog,[role="dialog"],[role="button"],[role="slider"],[role="tablist"],[contenteditable]:not([contenteditable="false"]),[draggable="true"],[data-swipe-ignore],[data-page-gesture-ignore],[aria-roledescription="carousel"],.team-carousel,.home-carousel,.insight-chart';
/** One-finger horizontal gestures stay in the SPA and leave native scrolling alone. */
export function connectPageGestures(router:Router,root:HTMLElement|Document=document){
 let start:{x:number;y:number;at:number;direction:number}|null=null,lastNavigation=-Infinity,stage:HTMLElement|null=null,settling:HTMLElement|null=null,timer:ReturnType<typeof setTimeout>|undefined;
 const clean=(element:HTMLElement|null)=>{element?.style.removeProperty('transition');element?.style.removeProperty('will-change');element?.style.removeProperty('--route-drag');};
 const reset=(animate=true)=>{clearTimeout(timer);clean(settling);settling=null;if(stage){const element=stage;stage=null;clean(element);if(animate&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){element.style.transition='transform 140ms ease-out';settling=element;timer=setTimeout(()=>{clean(element);settling=null;},150);}}};
 const cancel=()=>{start=null;reset();};
 const begin=(event:TouchEvent)=>{
  cancel();if(event.defaultPrevented||event.touches.length!==1||window.visualViewport&&window.visualViewport.scale>1.02||document.getSelection()?.isCollapsed===false)return;
  const target=event.target instanceof Element?event.target:null,focused=document.activeElement;
  if(!target||target.closest(interactive)||focused?.matches('input,textarea,[contenteditable="true"]')||document.querySelector('dialog[open],[role="dialog"][aria-modal="true"]'))return;
  for(let node:Element|null=target;node&&node!==document.body;node=node.parentElement){if(node.scrollWidth>node.clientWidth+4&&['auto','scroll'].includes(getComputedStyle(node).overflowX))return;}
  const point=event.touches[0]!,edge=Capacitor.getPlatform()==='web'?24:8;
  if(point.clientX<edge||point.clientX>innerWidth-edge)return;
  start={x:point.clientX,y:point.clientY,at:Date.now(),direction:0};stage=document.querySelector<HTMLElement>('.route-stage:not(.route-page-leave-active)');
 };
 const move=(event:TouchEvent)=>{
  if(!start)return;if(event.touches.length!==1||!event.cancelable){cancel();return;}
  const point=event.touches[0]!,dx=point.clientX-start.x,dy=Math.abs(point.clientY-start.y),distance=Math.abs(dx);
  if(distance<12&&dy<12)return;
  if(dy>distance||start.direction&&Math.sign(dx)!==start.direction){cancel();return;}
  if(distance>=18&&distance>dy*2){start.direction=Math.sign(dx);event.preventDefault();if(stage&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){stage.style.transition='none';stage.style.willChange='transform';stage.style.setProperty('--route-drag',Math.max(-64,Math.min(64,dx*.25))+'px');}}
 };
 const end=(event:TouchEvent)=>{
  const initial=start;start=null;if(!initial||event.changedTouches.length!==1||event.touches.length){reset();return;}
  const point=event.changedTouches[0]!,dx=point.clientX-initial.x,dy=Math.abs(point.clientY-initial.y),elapsed=Date.now()-initial.at;
  const commit=Math.abs(dx)>=100&&Math.abs(dx)>dy*2.5&&elapsed<900&&Date.now()-lastNavigation>450&&(!initial.direction||initial.direction===Math.sign(dx));
  reset(!commit);if(commit){if(event.cancelable)event.preventDefault();lastNavigation=Date.now();navigatePage(router,dx>0?'previous':'next');}
 };
 const listen=root as EventTarget;
 listen.addEventListener('touchstart',begin as EventListener,{passive:true});listen.addEventListener('touchmove',move as EventListener,{passive:false});listen.addEventListener('touchend',end as EventListener,{passive:false});listen.addEventListener('touchcancel',cancel,{passive:true});
 const removeGuard=router.afterEach?.(()=>cancel());
 return()=>{start=null;reset(false);listen.removeEventListener('touchstart',begin as EventListener);listen.removeEventListener('touchmove',move as EventListener);listen.removeEventListener('touchend',end as EventListener);listen.removeEventListener('touchcancel',cancel);removeGuard?.();};
}
