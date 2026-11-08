import {afterEach,expect,it} from 'vitest';
import {flushPromises,mount,type VueWrapper} from '@vue/test-utils';
import {createMemoryHistory,createRouter} from 'vue-router';
import {createNobiI18n} from '../../packages/i18n/src/index';
import PageSwitcher from '../../apps/fan/src/components/PageSwitcher.vue';
let wrapper:VueWrapper|undefined;
afterEach(()=>{wrapper?.unmount();history.replaceState({},'');});
it('offers keyboard-operable previous/next controls with current route labels in both languages',async()=>{
 const component={template:'<div />'},router=createRouter({history:createMemoryHistory(),routes:[{path:'/news',name:'news',component},{path:'/newsroom',name:'newsroom',component},{path:'/races',name:'races',component},{path:'/stats',name:'stats',component}]});await router.push('/newsroom');const i18n=createNobiI18n('zh-CN');wrapper=mount(PageSwitcher,{global:{plugins:[router,i18n]}});expect(wrapper.get('.previous-page').attributes('aria-label')).toBe('上一页：资讯');expect(wrapper.get('.next-page').attributes('aria-label')).toBe('下一页：赛事');expect(wrapper.get('nav').attributes('aria-label')).toContain('右滑上一页 · 左滑下一页');await wrapper.get('.next-page').trigger('click');await flushPromises();expect(router.currentRoute.value.path).toBe('/races');expect(wrapper.get('.previous-page').text()).toContain('F1 新闻专栏');i18n.global.locale.value='en-US';await flushPromises();expect(wrapper.get('.next-page').attributes('aria-label')).toBe('Next page: Stats');
});
