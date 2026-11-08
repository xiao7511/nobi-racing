import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { nextTick, ref, shallowRef } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createNobiI18n } from '../packages/i18n/src/index';
import type { NewsIndexItem, NewsMedia, NewsMediaItem, Newsroom } from '../apps/fan/src/api/newsroom';
import type { ReaderArticle } from '../apps/fan/src/api/newsroom-reader';
import NewsroomView from '../apps/fan/src/views/NewsroomView.vue';
import NewsroomArticleView from '../apps/fan/src/views/NewsroomArticleView.vue';
import LiveNewsMedia from '../apps/fan/src/components/LiveNewsMedia.vue';

const mocks = vi.hoisted(() => ({ useNewsroom: vi.fn(), useOriginalArticles: vi.fn(), readArticle: vi.fn() }));
vi.mock('../apps/fan/src/api/newsroom', () => ({ useNewsroom: mocks.useNewsroom }));
vi.mock('../apps/fan/src/api/newsroom-reader', () => ({ useOriginalArticles: mocks.useOriginalArticles, readArticle: mocks.readArticle }));

const firstId = 'a'.repeat(24), secondId = 'b'.repeat(24);
const embedUrl = 'https://players.brightcove.net/6057949432001/FC1Xxg8gIw_default/index.html?videoId=6357912345112';
const wrappers: VueWrapper[] = [];
const headline = (overrides: Partial<NewsIndexItem> = {}): NewsIndexItem => ({
  id: firstId, title: 'Driver wins the Grand Prix', titleZh: '车手赢得大奖赛', titleEn: 'Driver wins the Grand Prix',
  url: 'https://www.formula1.com/en/latest/article/test', publisher: 'www.formula1.com',
  indexedAt: new Date().toISOString(), publishedAt: null, bodyAvailable: false, language: 'en', topics: [], categories: ['race'], ...overrides,
});
function snapshot(items: NewsIndexItem[] = [headline()]): Newsroom {
  const now = new Date().toISOString();
  return { status: 'ready', source: 'GDELT Project', sourceUrl: 'https://www.gdeltproject.org/', termsUrl: 'https://www.gdeltproject.org/about.html#termsofuse',
    checkedAt: now, syncedAt: now, datasetAt: now, checkIntervalSeconds: 120, sourceCadenceMinutes: 15,
    expiresAt: new Date(Date.now() + 3600000).toISOString(), topics: [], items, error: null };
}
function article(id = firstId, overrides: Partial<ReaderArticle> = {}): ReaderArticle {
  return { id, kind: 'index-note', title: 'Driver wins the Grand Prix', titleZh: '车手赢得大奖赛',
    publishedAt: null, indexedAt: new Date().toISOString(), sourceName: 'www.formula1.com',
    sourceUrl: 'https://www.formula1.com/en/latest/article/test', licenseUrl: null, author: 'NOBI Racing',
    paragraphsZh: ['车手在大奖赛中赢得冠军。'], paragraphsEn: ['The driver won the Grand Prix.'],
    noticeZh: '新闻中文阅读说明', noticeEn: 'News reading note',
    sections: [{ headingZh: '赛事资料', headingEn: 'Race reference', rows: [{ zh: '测试分站', en: 'Test round' }] }], ...overrides };
}
function mediaItem(kind: 'photo' | 'video', overrides: Partial<NewsMediaItem> = {}): NewsMediaItem {
  return { id: kind === 'photo' ? firstId : secondId, kind, title: 'Latest official racing update', titleZh: '最新官方赛事动态',
    url: 'https://www.formula1.com/en/latest/article/test', imageUrl: 'https://media.formula1.com/image/upload/test.jpg',
    publishedAt: new Date().toISOString(), publisher: 'www.formula1.com', ...(kind === 'video' ? { embedUrl } : {}), ...overrides };
}
function liveMedia(overrides: Partial<NewsMedia> = {}): NewsMedia {
  const now = new Date().toISOString();
  return { status: 'ready', checkedAt: now, syncedAt: now, checkIntervalSeconds: 600, sourceName: 'Formula 1', sourceUrl: 'https://www.formula1.com/',
    photos: [mediaItem('photo')], videos: [mediaItem('video')], error: null, ...overrides };
}
let feed = shallowRef<Newsroom>(snapshot());
async function setup(path = '/newsroom') {
  const i18n = createNobiI18n('zh-CN');
  const empty = { template: '<div />' };
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/newsroom', name: 'newsroom', component: empty },
    { path: '/newsroom/:id', name: 'newsroom-article', component: empty },
    { path: '/:pathMatch(.*)*', component: empty },
  ] });
  await router.push(path); await router.isReady();
  return { i18n, router, global: { plugins: [router, i18n] } };
}
beforeEach(() => {
  feed = shallowRef(snapshot());
  mocks.useNewsroom.mockReturnValue({ data: feed, error: ref(false), connected: ref(true), reload: vi.fn() });
  mocks.useOriginalArticles.mockReturnValue(ref([]));
  mocks.readArticle.mockReset().mockResolvedValue(article());
});

describe('automatically synchronized picture and video news', () => {
  it('replaces photo news and localized captions when a new media snapshot arrives', async () => {
    const config = await setup(), i18n = config.i18n;
    const wrapper = mount(LiveNewsMedia, { props: { media: liveMedia({ photos: [mediaItem('photo', { titleZh: null })] }), mode: 'photos' }, global: config.global });
    wrappers.push(wrapper);
    expect(wrapper.get('.newsroom-media-card h3').text()).toBe('中文标题翻译中');
    expect(wrapper.get('img').attributes('alt')).not.toContain('Latest official');
    const incoming = mediaItem('photo', { id: 'c'.repeat(24), titleZh: '新同步的分站图片新闻', imageUrl: 'https://media.formula1.com/image/upload/new.jpg' });
    await wrapper.setProps({ media: liveMedia({ photos: [incoming] }) });
    expect(wrapper.findAll('.newsroom-media-card')).toHaveLength(1);
    expect(wrapper.get('.newsroom-media-card h3').text()).toBe('新同步的分站图片新闻');
    expect(wrapper.get('.newsroom-media-card h3 a').attributes('href')).toBe('/newsroom/' + incoming.id);
    expect(wrapper.get('img').attributes('src')).toBe(incoming.imageUrl);
    i18n.global.locale.value = 'en-US'; await nextTick();
    expect(wrapper.get('.newsroom-media-card h3').text()).toBe(incoming.title);
    await wrapper.get('img').trigger('error');
    expect(wrapper.find('img').exists()).toBe(false);
    expect(wrapper.get('.newsroom-media-card a[target=_blank]').attributes('href')).toBe(incoming.url);
    await wrapper.get('.newsroom-media-card h3 a').trigger('click'); await flushPromises();
    expect(config.router.currentRoute.value.path).toBe('/newsroom/' + incoming.id);
  });

  it('loads the official player on click and removes it when the selected video expires', async () => {
    vi.useFakeTimers();
    const config = await setup();
    const wrapper = mount(LiveNewsMedia, { props: { media: liveMedia(), mode: 'videos' }, global: config.global });
    wrappers.push(wrapper);
    expect(wrapper.find('iframe').exists()).toBe(false);
    await wrapper.get('.newsroom-media-card button').trigger('click');
    expect(wrapper.get('iframe').attributes('src')).toBe(embedUrl);
    expect(wrapper.get('.newsroom-live-player h3').text()).toBe('最新官方赛事动态');
    await wrapper.setProps({ media: liveMedia({ videos: [mediaItem('video', { id: 'd'.repeat(24) })] }) });
    expect(wrapper.find('iframe').exists()).toBe(false);
    expect(wrapper.find('.newsroom-live-player').exists()).toBe(false);
  });

  it('refuses a foreign player URL and shows a useful recovery action', async () => {
    vi.useFakeTimers();
    const config = await setup();
    const wrapper = mount(LiveNewsMedia, { props: { media: liveMedia({ videos: [mediaItem('video', { embedUrl: 'https://players.brightcove.net.evil.test/embed' })] }), mode: 'videos' }, global: config.global });
    wrappers.push(wrapper);
    await wrapper.get('.newsroom-media-card button').trigger('click');
    expect(wrapper.find('iframe').exists()).toBe(false);
    expect(wrapper.get('[role=alert]').text()).toContain('官方播放器暂时无法连接');
    expect(wrapper.get('[role=alert] button').text()).toBe('重试播放');
    await wrapper.setProps({ mode: 'photos' });
    expect(wrapper.find('.newsroom-live-player').exists()).toBe(false);
  });
});
afterEach(() => { for (const wrapper of wrappers.splice(0)) wrapper.unmount(); vi.useRealTimers(); });

describe('newsroom navigation and Simplified Chinese', () => {
  it('opens every indexed headline inside the app even when no reviewed body exists', async () => {
    feed.value = snapshot([headline(), headline({ id: secondId, title: 'A fresh untranslated headline', titleZh: null })]);
    const config = await setup();
    const wrapper = mount(NewsroomView, config); wrappers.push(wrapper);
    const cards = wrapper.findAll('.newsroom-index-card');
    expect(cards).toHaveLength(2);
    for (const [index, card] of cards.entries()) {
      const id = index === 0 ? firstId : secondId;
      expect(card.get('h2 a').attributes('href')).toBe('/newsroom/' + id);
      expect(card.get('a.button').attributes('href')).toBe('/newsroom/' + id);
      expect(card.get('h2').text()).not.toContain('A fresh untranslated headline');
    }
    await cards[1]!.get('h2 a').trigger('click'); await flushPromises();
    expect(config.router.currentRoute.value.path).toBe('/newsroom/' + secondId);
  });

  it('changes displayed headlines with the interface language and incorporates a newly synchronized translation', async () => {
    feed.value = snapshot([headline({ titleZh: null })]);
    const config = await setup();
    const wrapper = mount(NewsroomView, config); wrappers.push(wrapper);
    expect(wrapper.get('.newsroom-index-card h2').text()).toContain('中文');
    expect(wrapper.get('.newsroom-index-card h2').text()).not.toContain('Driver wins');
    config.i18n.global.locale.value = 'en-US'; await nextTick();
    expect(wrapper.get('.newsroom-index-card h2').text()).toContain('Driver wins');
    config.i18n.global.locale.value = 'zh-CN';
    feed.value = snapshot([headline({ titleZh: '新同步的中文新闻标题' })]); await nextTick();
    expect(wrapper.get('.newsroom-index-card h2').text()).toContain('新同步的中文新闻标题');
    expect(wrapper.text()).not.toContain('条新闻正在翻译');
  });

  it('switches the detail title, body and reference sections together without navigation', async () => {
    const config = await setup('/newsroom/' + firstId);
    const wrapper = mount(NewsroomArticleView, config); wrappers.push(wrapper); await flushPromises();
    expect(wrapper.get('h1').text()).toBe('车手赢得大奖赛');
    expect(wrapper.get('.prose').text()).toContain('车手在大奖赛中赢得冠军。');
    expect(wrapper.get('.prose').text()).toContain('赛事资料测试分站');
    expect(wrapper.attributes('lang')).toBe('zh-CN');
    config.i18n.global.locale.value = 'en-US'; await nextTick();
    expect(wrapper.get('h1').text()).toBe('Driver wins the Grand Prix');
    expect(wrapper.get('.prose').text()).toContain('The driver won the Grand Prix.');
    expect(wrapper.get('.prose').text()).not.toContain('车手在大奖赛');
    config.i18n.global.locale.value = 'zh-CN'; await nextTick();
    expect(wrapper.get('h1').text()).toBe('车手赢得大奖赛');
  });

  it('keeps a newer article loading when an aborted previous route request completes late', async () => {
    let finishFirst!: (value: ReaderArticle) => void, finishSecond!: (value: ReaderArticle) => void;
    mocks.readArticle.mockImplementationOnce(() => new Promise<ReaderArticle>(resolve => { finishFirst = resolve; }))
      .mockImplementationOnce(() => new Promise<ReaderArticle>(resolve => { finishSecond = resolve; }));
    const config = await setup('/newsroom/' + firstId);
    const wrapper = mount(NewsroomArticleView, config); wrappers.push(wrapper);
    await config.router.push('/newsroom/' + secondId); await nextTick();
    finishFirst(article()); await flushPromises();
    expect(wrapper.get('[role=status]').text()).toContain('正在加载新闻');
    expect(wrapper.find('h1').exists()).toBe(false);
    finishSecond(article(secondId, { titleZh: '第二篇新闻' })); await flushPromises();
    expect(wrapper.get('h1').text()).toBe('第二篇新闻');
    expect(wrapper.find('[role=alert]').exists()).toBe(false);
  });

  it('provides an actionable retry when a Chinese translation is temporarily unavailable', async () => {
    mocks.readArticle.mockResolvedValueOnce(article(firstId, { translationStatus: 'pending', titleZh: '', paragraphsZh: ['中文翻译暂不可用，请重试。'] }))
      .mockResolvedValueOnce(article());
    const config = await setup('/newsroom/' + firstId);
    const wrapper = mount(NewsroomArticleView, config); wrappers.push(wrapper); await flushPromises();
    expect(wrapper.get('h1').text()).not.toContain('Driver wins');
    await wrapper.get('button').trigger('click'); await flushPromises();
    expect(mocks.readArticle).toHaveBeenCalledTimes(2);
    expect(wrapper.get('h1').text()).toBe('车手赢得大奖赛');
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('automatically replaces a pending translation and stops polling after leaving the reader', async () => {
    vi.useFakeTimers();
    mocks.readArticle.mockResolvedValueOnce(article(firstId, { translationStatus: 'pending', titleZh: '正在翻译新闻标题' }))
      .mockResolvedValue(article(firstId, { translationStatus: 'ready' }));
    const config = await setup('/newsroom/' + firstId);
    const wrapper = mount(NewsroomArticleView, config); wrappers.push(wrapper); await flushPromises();
    expect(wrapper.get('h1').text()).toBe('正在翻译新闻标题');
    await vi.advanceTimersByTimeAsync(30000); await flushPromises();
    expect(wrapper.get('h1').text()).toBe('车手赢得大奖赛');
    expect(mocks.readArticle).toHaveBeenCalledTimes(2);
    wrapper.unmount(); wrappers.splice(wrappers.indexOf(wrapper), 1);
    await vi.advanceTimersByTimeAsync(60000);
    expect(mocks.readArticle).toHaveBeenCalledTimes(2);
  });
});
