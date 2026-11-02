<script setup lang="ts">
import {safeHref} from '../lib/navigation-links';
import {computed,ref,useId,watch} from 'vue';
import {useI18n} from 'vue-i18n';
import {assetUrl} from '../lib/urls';
import maps from '../content/circuit-maps.json';
const props=defineProps<{circuit:string}>();
const {t,locale}=useI18n();
const diagram=computed(()=>Object.hasOwn(maps,props.circuit)?maps[props.circuit as keyof typeof maps]:null);
const name=computed(()=>diagram.value?(locale.value==='zh-CN'?diagram.value.nameZh:diagram.value.name):props.circuit);
const failed=ref(false);const dialog=ref<HTMLDialogElement>();const titleId=useId();
watch(()=>props.circuit,()=>{failed.value=false;dialog.value?.close();});
const location=computed(()=>diagram.value?`https://www.openstreetmap.org/?mlat=${diagram.value.latitude}&mlon=${diagram.value.longitude}#map=15/${diagram.value.latitude}/${diagram.value.longitude}`:'');
function closeBackdrop(event:MouseEvent){if(event.target===dialog.value)dialog.value.close();}
</script>
<template><figure class="circuit-map" :data-circuit="circuit"><template v-if="diagram&&!failed"><button type="button" class="circuit-map-preview" :aria-label="t('circuitMap.open',{name})" @click="dialog?.showModal()"><span class="circuit-map-heading">{{t('circuitMap.title')}}<span>{{t('circuitMap.enlarge')}} ↗</span></span><img :src="assetUrl(diagram.src)" :alt="t('circuitMap.alt',{name})" width="500" height="500" loading="lazy" decoding="async" @error="failed=true"/><span class="circuit-map-name">{{name}}</span></button><figcaption><span>Jules Roy / <a :href="safeHref(diagram.source)" :target="(safeHref(diagram.source))?.startsWith('#/')?undefined:'_blank'" rel="noopener noreferrer">F1DB</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a></span><a :href="safeHref(location)" :target="(safeHref(location))?.startsWith('#/')?undefined:'_blank'" rel="noopener noreferrer">{{t('circuitMap.location')}} ↗</a></figcaption><dialog ref="dialog" class="circuit-map-dialog" :aria-labelledby="titleId" @click="closeBackdrop"><div class="circuit-map-dialog-header"><h2 :id="titleId">{{name}}</h2><button type="button" :aria-label="t('circuitMap.close')" @click="dialog?.close()">×</button></div><img :src="assetUrl(diagram.src)" :alt="t('circuitMap.alt',{name})" width="500" height="500"/><p>{{t('circuitMap.note')}}</p><p class="caption">Jules Roy / F1DB · <a :href="safeHref(diagram.source)" :target="(safeHref(diagram.source))?.startsWith('#/')?undefined:'_blank'" rel="noopener noreferrer">{{t('circuitMap.source')}} ↗</a> · <a :href="safeHref(assetUrl('/media/circuits/LICENSE.txt'))" :target="(safeHref(assetUrl('/media/circuits/LICENSE.txt')))?.startsWith('#/')?undefined:'_blank'" rel="noopener noreferrer">CC BY 4.0</a></p></dialog></template><p v-else class="notice" role="status">{{t('circuitMap.unavailable')}}</p></figure></template>
