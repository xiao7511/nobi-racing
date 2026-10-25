<script setup lang="ts">
import { watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePreferences, type Section } from './stores/preferences';
const { t, locale } = useI18n();
const preferences = usePreferences();
const sections: Section[] = ['home', 'races', 'news', 'data', 'profile'];
watchEffect(() => { document.documentElement.lang = locale.value; });
</script>
<template>
  <div class="shell">
    <header><span class="brand">NOBI RACING</span><label>{{ t('common.language') }} <select v-model="locale"><option value="en">English</option><option value="zh-CN">简体中文</option></select></label></header>
    <main>
      <p class="eyebrow">{{ t('common.phase') }}</p>
      <h1>{{ preferences.section === 'home' ? t('home.title') : t('nav.' + preferences.section) }}</h1>
      <p class="muted">{{ preferences.section === 'home' ? t('home.description') : t('placeholder') }}</p>
      <section class="panel"><h2>{{ t('common.empty') }}</h2><p>{{ t('placeholder') }}</p></section>
    </main>
    <nav :aria-label="locale === 'en' ? 'Main navigation' : '主导航'">
      <button v-for="section in sections" :key="section" :aria-current="preferences.section === section ? 'page' : undefined" @click="preferences.section = section">{{ t('nav.' + section) }}</button>
    </nav>
  </div>
</template>
