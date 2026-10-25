<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { usePreferences } from './stores/preferences';
import { connectNativeBack } from './native';
import { dataTransport } from './api/transport';
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const preferences = usePreferences();
const links = [{ key: 'home', path: '/', icon: '⌂' }, { key: 'news', path: '/news', icon: '▤' }, { key: 'races', path: '/races', icon: '⚑' }, { key: 'data', path: '/stats', icon: '▥' }, { key: 'profile', path: '/profile', icon: '◎' }];
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
let disposed = false;
onMounted(async () => { const release = await connectNativeBack(router); if (disposed) release(); else releaseNative = release; });
onBeforeUnmount(() => { disposed = true; releaseNative(); });
onMounted(() => { media.addEventListener('change', updateMedia); window.addEventListener('online', updateOnline); window.addEventListener('offline', updateOnline); });
onBeforeUnmount(() => { media.removeEventListener('change', updateMedia); window.removeEventListener('online', updateOnline); window.removeEventListener('offline', updateOnline); });
watchEffect(() => {
  locale.value = preferences.locale;
  document.documentElement.lang = preferences.locale;
  document.documentElement.dataset.theme = preferences.theme === 'system' ? (systemDark.value ? 'dark' : 'light') : preferences.theme;
});
watch(() => [route.fullPath, locale.value], () => {
  document.title = `${t('titles.' + String(route.name || 'not-found'))} · NOBI Racing`;
  requestAnimationFrame(() => { document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true }); });
}, { immediate: true });
const active = (path: string) => path === '/' ? route.path === '/' : path === '/stats' ? route.path.startsWith('/stats') || route.path.startsWith('/drivers') || route.path.startsWith('/teams') : path === '/profile' ? route.path === '/profile' || route.path === '/settings' : route.path.startsWith(path);
</script>
<template>
  <a class="skip-link" href="#main-content" @click.prevent="focusMain">{{ t('common.skip') }}</a>
  <div class="fan-shell" :data-transport="dataTransport">
    <header class="topbar"><RouterLink to="/" class="brand" aria-label="NOBI Racing"><span class="brand-mark" aria-hidden="true">N</span> NOBI<span class="brand-sub">RACING</span></RouterLink><span class="top-edition">{{ t('common.edition') }}</span><div class="top-actions"><label class="language-control"><span class="sr-only">{{ t('common.language') }}</span><select :value="preferences.locale" @change="preferences.setLocale(($event.target as HTMLSelectElement).value)"><option value="en-US">English</option><option value="zh-CN">简体中文</option></select></label><RouterLink class="settings-link" to="/settings" :aria-label="t('settings.title')">⚙</RouterLink></div></header>
    <aside class="sidebar"><p class="sidebar-caption">{{ t('common.explore') }}</p><nav class="main-nav" :aria-label="t('common.navigation')"><RouterLink v-for="link in links" :key="link.key" :to="link.path" :aria-current="active(link.path) ? 'page' : undefined" :class="{ selected: active(link.path) }"><span class="nav-icon" aria-hidden="true">{{ link.icon }}</span><span>{{ t('nav.' + link.key) }}</span></RouterLink></nav><div class="sidebar-note"><span class="status-dot"></span>{{ t('common.preview') }}<p>{{ t('common.localOnly') }}</p></div></aside>
    <main id="main-content" class="main-content" tabindex="-1"><div class="preview-banner"><span class="mock-pill">MOCK</span><span>{{ t(dataTransport === 'backend' ? 'api.backendNotice' : 'common.mockNotice') }}</span></div><p v-if="!online" class="notice" role="status">{{ t(dataTransport === 'backend' ? 'api.offline' : 'common.offline') }}</p><RouterView v-slot="{ Component }"><component :is="Component" :key="route.path"/></RouterView><footer class="page-footer"><span>NOBI RACING / {{ t('common.edition') }}</span><span>{{ t('common.original') }}</span></footer></main>
  </div>
</template>
