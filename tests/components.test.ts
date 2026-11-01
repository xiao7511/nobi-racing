import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import { defineComponent, nextTick } from 'vue';
import { createNobiI18n } from '../packages/i18n/src/index';
import { useResource } from '../apps/fan/src/composables/useResource';
import { usePreferences } from '../apps/fan/src/stores/preferences';
import ResourceState from '../apps/fan/src/components/ResourceState.vue';
import NewsView from '../apps/fan/src/views/NewsView.vue';
import ArticleView from '../apps/fan/src/views/ArticleView.vue';
import StatsView from '../apps/fan/src/views/StatsView.vue';
import SettingsView from '../apps/fan/src/views/SettingsView.vue';
// These tests exercise the explicit original-story fixture experience.
vi.mock('../apps/fan/src/api/transport', () => ({ dataTransport: 'fixture' }));
beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); });
afterEach(() => vi.useRealTimers());
const setup = async () => {
  const pinia = createPinia(); setActivePinia(pinia);
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }] });
  await router.push('/news/mock-aero'); await router.isReady();
  return { global: { plugins: [pinia, createNobiI18n(), router] } };
};
const settle = async () => { await vi.runAllTimersAsync(); await flushPromises(); };
describe('resource and page components', () => {
  it('renders loading, empty and retryable error states in both languages', async () => {
    const i18n = createNobiI18n();
    const wrapper = mount(ResourceState, { props: { loading: true }, global: { plugins: [i18n] } });
    expect(wrapper.get('[role=status]').text()).toContain('Loading');
    await wrapper.setProps({ loading: false, error: 'MOCK_UNAVAILABLE' });
    await wrapper.get('button').trigger('click'); expect(wrapper.emitted('retry')).toHaveLength(1);
    i18n.global.locale.value = 'zh-CN'; await nextTick(); expect(wrapper.text()).toContain('暂时无法');
    await wrapper.setProps({ error: null, empty: true }); expect(wrapper.text()).toContain('这里暂时没有内容'); wrapper.unmount();
  });
  it('filters news by category and search and shows a real empty state', async () => {
    const wrapper = mount(NewsView, await setup()); await settle();
    expect(wrapper.findAll('.news-card')).toHaveLength(4);
    await wrapper.findAll('.filter-group button')[2]!.trigger('click');
    expect(wrapper.findAll('.news-card')).toHaveLength(2);
    await wrapper.get('input').setValue('no-match'); expect(wrapper.findAll('.news-card')).toHaveLength(0);
    expect(wrapper.get('[role=status]').text()).toContain('Nothing here'); wrapper.unmount();
  });
  it('saves an article through the rendered button', async () => {
    const config = await setup();
    const router = config.global.plugins[2] as ReturnType<typeof createRouter>;
    router.addRoute({ path: '/news/:id', component: ArticleView });
    await router.push('/news/mock-aero');
    const wrapper = mount(ArticleView, config); await settle();
    await wrapper.get('button').trigger('click');
    expect(usePreferences().savedArticleIds).toEqual(['mock-aero']);
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('true'); wrapper.unmount();
  });
  it('aggregates fictional team standings from the driver snapshot', async () => {
    const wrapper = mount(StatsView, await setup()); await settle();
    expect(wrapper.findAll('tbody tr')).toHaveLength(4);
    await wrapper.findAll('.filter-group button')[1]!.trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(3);
    expect(wrapper.findAll('tbody tr')[0]!.text()).toContain('517.5'); wrapper.unmount();
  });
  it('changes appearance and timezone through settings controls', async () => {
    const wrapper = mount(SettingsView, await setup());
    await wrapper.get('#theme').setValue('light'); await wrapper.get('#timezone').setValue('Asia/Shanghai');
    expect(usePreferences().theme).toBe('light'); expect(usePreferences().timeZone).toBe('Asia/Shanghai'); wrapper.unmount();
  });
  it('discards a stale result after retry and cancels work on unmount', async () => {
    let resolveFirst!: (value: string) => void;
    let lastSignal: AbortSignal | undefined;
    let calls = 0;
    const loader = (signal: AbortSignal) => { lastSignal = signal; return ++calls === 1 ? new Promise<string>(resolve => { resolveFirst = resolve; }) : Promise.resolve('new'); };
    const wrapper = mount(defineComponent({ setup() { return useResource(loader); }, template: '<div><button @click="reload">retry</button><span>{{ data }}</span></div>' }));
    await wrapper.get('button').trigger('click'); await flushPromises(); resolveFirst('old'); await flushPromises();
    expect(wrapper.get('span').text()).toBe('new'); wrapper.unmount(); expect(lastSignal?.aborted).toBe(true);
  });
});
