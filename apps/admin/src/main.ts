import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createNobiI18n, normalizeLocale } from '@nobi/i18n';
import '@nobi/design-tokens/tokens.css';
import '@nobi/design-tokens/base.css';
import App from './App.vue';
const locale = normalizeLocale(navigator.language);
createApp(App).use(createPinia()).use(createNobiI18n(locale)).mount('#app');
