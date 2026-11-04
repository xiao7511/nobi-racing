<script setup lang="ts">
import NavIcon from './components/NavIcon.vue';
import {connectViewport} from './lib/display-insets';
import { computed, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { usePreferences } from './stores/preferences';
import { connectNativeBack } from './native';
import {connectPageGestures} from './lib/page-gestures';
import {useCommunityInbox} from './composables/useCommunityInbox';
import {forumUnread} from './stores/community';
import {publicReference} from './lib/urls';
import { dataTransport } from './api/transport';
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const preferences = usePreferences();
useCommunityInbox();
const historicalStats = computed(() => dataTransport === 'backend' && route.path === '/stats');
const personalWorld = computed(() => dataTransport === 'backend' && route.path === '/profile');
const links = [{ key: 'home', path: '/', icon: '⌂' }, { key: 'news', path: '/news', icon: '▤' }, { key: 'newsroom', path: '/newsroom', icon: '▧' }, { key: 'races', path: '/races', icon: '⚑' }, { key: 'data', path: '/stats', icon: '▥' }, { key: 'profile', path: '/profile', icon: '◎' }, { key: 'forum', path: '/forum', icon: '☷' }];
const mobileActive=(path:string)=>path==='/profile'?/^\/(profile|settings|stats|drivers|teams|forum|sources|legal)(?:\/|$)/.test(route.path):active(path);
const removeNavigationGuard=router.beforeEach(()=>{const element=document.activeElement;if(element instanceof HTMLElement)element.blur();});
onBeforeUnmount(removeNavigationGuard);
const online = ref(navigator.onLine);
const media = window.matchMedia('(prefers-color-scheme: dark)');
const systemDark = ref(media.matches);
const updateMedia = () => { systemDark.value = media.matches; };
const updateOnline = () => { online.value = navigator.onLine; };
function focusMain() {
  const main = document.getElementById('main-content');
  main?.focus({ preventScroll: true });
  main?.scrollIntoView({ block: 'start' });
}
let releaseNative = () => {};
let releaseGestures=()=>{};let releaseViewport=()=>{};let navigationTimer:ReturnType<typeof setTimeout>|undefined;
const removeAfterNavigation=router.afterEach(()=>{clearTimeout(navigationTimer);navigationTimer=setTimeout(()=>{delete document.documentElement.dataset.navigation;},240);});onBeforeUnmount(()=>{removeAfterNavigation();clearTimeout(navigationTimer);});
let disposed = false;
onMounted(async () => { const release = await connectNativeBack(router); if (disposed) release(); else releaseNative = release; });
onBeforeUnmount(() => { disposed = true; releaseNative(); });
onMounted(()=>{releaseGestures=connectPageGestures(router);releaseViewport=connectViewport();});onBeforeUnmount(()=>{releaseGestures();releaseViewport();});
onMounted(() => { media.addEventListener('change', updateMedia); window.addEventListener('online', updateOnline); window.addEventListener('offline', updateOnline); });
onBeforeUnmount(() => { media.removeEventListener('change', updateMedia); window.removeEventListener('online', updateOnline); window.removeEventListener('offline', updateOnline); });
watchEffect(() => {
  locale.value = preferences.locale;
  document.documentElement.lang = preferences.locale;
  document.documentElement.dataset.theme = preferences.theme === 'system' ? (systemDark.value ? 'dark' : 'light') : preferences.theme;
});
watch(() => [route.fullPath, locale.value], () => {
  document.title = `${t('titles.' + String(route.name || 'not-found'))} · NOBI Racing`;
  requestAnimationFrame(() => { document.querySelector<HTMLElement>('main .route-stage:not(.route-page-leave-active) h1')?.focus({ preventScroll: true }); });
}, { immediate: true });
const active = (path: string) => path === '/' ? route.path === '/' : path === '/news' ? /^\/news(?:\/|$)/.test(route.path) : path === '/stats' ? route.path.startsWith('/stats') || route.path.startsWith('/drivers') || route.path.startsWith('/teams') : path === '/profile' ? route.path === '/profile' || route.path === '/settings' : path === '/races' ? route.path.startsWith('/races') || route.path.startsWith('/weekends') : route.path.startsWith(path);
</script>
<template>
  <a class="skip-link" href="#main-content" @click.prevent="focusMain">{{ t('common.skip') }}</a>
  <div class="fan-shell" :data-transport="dataTransport">
    <header class="topbar"><RouterLink to="/" class="brand" aria-label="NOBI Racing"><span class="brand-mark" aria-hidden="true">N</span> NOBI<span class="brand-sub">RACING</span></RouterLink><span class="top-edition">{{ t('common.edition') }}</span><div class="top-actions"><label class="language-control"><span class="sr-only">{{ t('common.language') }}</span><select :value="preferences.locale" @change="preferences.setLocale(($event.target as HTMLSelectElement).value)"><option value="en-US">English</option><option value="zh-CN">简体中文</option></select></label><RouterLink class="settings-link" to="/settings" :aria-label="t('settings.title')">⚙</RouterLink></div></header>
    <aside class="sidebar"><p class="sidebar-caption">{{ t('common.explore') }}</p><nav class="main-nav" :aria-label="t('common.navigation')"><RouterLink v-for="link in links" :key="link.key" :to="link.path" :data-secondary="['data','forum'].includes(link.key)" :aria-label="t('nav.'+link.key)" :aria-current="active(link.path) ? 'page' : undefined" :class="{ selected: active(link.path), 'mobile-selected':mobileActive(link.path) }"><span class="nav-icon" aria-hidden="true"><NavIcon :name="link.key"/><b v-if="link.key==='profile'&&forumUnread" class="nav-unread">{{forumUnread>99?'99+':forumUnread}}</b></span><span>{{ t('nav.' + link.key) }}</span></RouterLink></nav><div class="sidebar-note"><span class="status-dot"></span>{{ t(publicReference?'publicData.publicEdition':'common.preview') }}<p>{{ t('common.localOnly') }}</p></div></aside>
    <main id="main-content" class="main-content" tabindex="-1"><div v-if="!route.path.startsWith('/newsroom')" class="preview-banner"><span class="mock-pill">{{ route.path==='/newsroom'?'NEWS':historicalStats ? (publicReference?'F1DB':'OPENF1') : personalWorld ? 'LOCAL' : publicReference ? 'F1DB' : 'MOCK' }}</span><span>{{ t(route.path==='/newsroom'?'newsroom.banner':publicReference?'publicData.banner':personalWorld ? 'world.banner' : historicalStats ? 'insights.banner' : dataTransport === 'backend' ? 'api.backendNotice' : 'common.mockNotice') }}</span></div><p v-if="!online" class="notice" role="status">{{ t(dataTransport === 'backend' ? 'api.offline' : 'common.offline') }}</p><p v-if="preferences.storageUnavailable && route.path !== '/settings'" class="notice" role="alert">{{t('settings.storageUnavailable')}}</p><p v-if="preferences.collectionLimitReached" class="notice" role="alert">{{t('world.limit')}}</p><div class="route-viewport"><RouterView v-slot="{ Component }"><Transition name="route-page"><div :key="route.path" class="route-stage"><component :is="Component"/></div></Transition></RouterView></div><footer class="page-footer"><span>NOBI RACING / {{ t('common.edition') }}</span><RouterLink to="/legal">{{ t('legal.title') }} ↗</RouterLink><p class="legal-disclaimer">{{ t('legal.disclaimer') }}</p></footer></main>
  </div>
</template>
