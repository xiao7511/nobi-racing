import {Capacitor} from '@capacitor/core';
export function connectViewport(){
 const root=document.documentElement;root.dataset.platform=Capacitor.getPlatform();let baseline=window.innerHeight,lastWidth=window.innerWidth;
 const update=()=>{if(Math.abs(window.innerWidth-lastWidth)>80){baseline=window.innerHeight;lastWidth=window.innerWidth;}const focused=document.activeElement?.matches('input:not([type=checkbox]):not([type=radio]),textarea,[contenteditable=true]');if(!focused)baseline=Math.max(baseline,window.innerHeight);const keyboard=!!focused&&baseline-(window.visualViewport?.height||window.innerHeight)>120;root.dataset.keyboard=keyboard?'open':'closed';};
 window.addEventListener('resize',update);window.visualViewport?.addEventListener('resize',update);document.addEventListener('focusin',update);document.addEventListener('focusout',update);update();
 return()=>{window.removeEventListener('resize',update);window.visualViewport?.removeEventListener('resize',update);document.removeEventListener('focusin',update);document.removeEventListener('focusout',update);delete root.dataset.keyboard;};
}
