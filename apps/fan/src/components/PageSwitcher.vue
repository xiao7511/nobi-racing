<script setup lang="ts">
import {computed} from 'vue';
import {useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {pageDestinations,navigatePage,type PageDestination} from '../lib/page-gestures';
const router=useRouter(),{t,locale}=useI18n(),zh=computed(()=>locale.value==='zh-CN');
const destinations=computed(()=>pageDestinations(router));
const title=(destination:PageDestination)=>t('titles.'+String(router.resolve(destination.to).name||'home'));
const hint=computed(()=>zh.value?'右滑上一页 · 左滑下一页':'Swipe right for previous · left for next');
</script>
<template>
 <nav class="page-switcher" :aria-label="zh?'页面切换：'+hint:'Page navigation: '+hint">
  <button type="button" class="button previous-page" aria-controls="page-route-content" :aria-label="(zh?'上一页：':'Previous page: ')+title(destinations.previous)" @click="navigatePage(router,'previous')"><span aria-hidden="true">←</span> <span>{{title(destinations.previous)}}</span></button>
  <span class="caption page-swipe-hint">{{hint}}</span>
  <button type="button" class="button next-page" aria-controls="page-route-content" :aria-label="(zh?'下一页：':'Next page: ')+title(destinations.next)" @click="navigatePage(router,'next')"><span>{{title(destinations.next)}}</span> <span aria-hidden="true">→</span></button>
 </nav>
</template>
<style scoped>
.page-switcher{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:16px 0;min-width:0}.page-switcher .button{display:flex;align-items:center;gap:8px;max-width:36%;min-width:0;font-size:12px;min-height:40px}.page-switcher .button span:not([aria-hidden]){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.page-swipe-hint{text-align:center;margin:0;line-height:1.5}.next-page{margin-left:auto}@media(max-width:600px){.page-switcher{gap:8px}.page-swipe-hint{font-size:10px;max-width:110px}.page-switcher .button{padding:8px;max-width:34%;gap:5px}}@media(prefers-reduced-motion:reduce){.page-switcher .button{transition:none}}
</style>
