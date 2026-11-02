<script setup lang="ts">
import {safeHref} from '../lib/navigation-links';
import {computed,onScopeDispose,ref} from 'vue';
import {usePage} from '../composables/usePage';
import {useResource} from '../composables/useResource';
import {weekends} from '../api/weekends';
import {racePhotos} from '../content/race-photos';
import {assetUrl} from '../lib/urls';
defineProps<{hero?:boolean}>();
const {t,locale}=usePage();const state=useResource(weekends,[],{volatile:true,preserveWhileRefreshing:true});
const now=ref(Date.now());const timer=setInterval(()=>{now.value=Date.now();},1000);onScopeDispose(()=>clearInterval(timer));const failed=ref(false);
const meeting=computed(()=>{const data=state.data.value;if(data?.status!=='ready'||Date.parse(data.expiresAt!)<=now.value)return null;const eligible=data.items.filter(item=>!item.cancelled&&Date.parse(item.startsAt)<=now.value).sort((a,b)=>Date.parse(b.startsAt)-Date.parse(a.startsAt));return eligible[0];});
const photo=computed(()=>meeting.value?racePhotos.find(item=>item.circuit===meeting.value!.circuit&&item.year===2026):null);
</script>
<template><figure v-if="photo&&!failed" class="latest-race-photo" :class="{'race-photo-hero':hero}"><img :src="assetUrl(photo.src)" :alt="locale==='zh-CN'?photo.altZh:photo.alt" width="2880" height="1920" decoding="async" @error="failed=true"/><figcaption><span>{{t('publicData.currentPhoto')}} · {{photo.capturedAt}} · {{photo.credit}}</span><span><a :href="safeHref(photo.source)" :target="(safeHref(photo.source))?.startsWith('#/')?undefined:'_blank'" rel="noopener noreferrer">{{t('circuitMap.source')}} ↗</a> · <a :href="safeHref(photo.terms)" :target="(safeHref(photo.terms))?.startsWith('#/')?undefined:'_blank'" rel="noopener noreferrer">{{t('publicData.photoRights')}} ↗</a></span></figcaption></figure><p v-else-if="!hero" class="caption">{{t('publicData.photoPending')}}</p></template>
