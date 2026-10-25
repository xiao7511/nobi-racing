import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
const native = vi.hoisted(() => ({ platform: 'web', callback: () => {}, remove: vi.fn(), minimize: vi.fn(), listen: vi.fn() }));
vi.mock('@capacitor/core', () => ({ Capacitor: { getPlatform: () => native.platform } }));
vi.mock('@capacitor/app', () => ({ App: { minimizeApp: native.minimize, addListener: native.listen } }));
import { connectNativeBack } from '../apps/fan/src/native';
beforeEach(() => {
  native.platform = 'web'; native.remove.mockReset(); native.minimize.mockReset();
  native.listen.mockReset().mockImplementation(async (_name: string, callback: () => void) => { native.callback = callback; return { remove: native.remove }; });
});
describe('Capacitor back navigation boundary', () => {
  const makeRouter = () => createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }] });
  it('does not invoke native APIs on web', async () => {
    const release = await connectNativeBack(makeRouter()); release(); expect(native.listen).not.toHaveBeenCalled();
  });
  it('minimizes Android at home and returns direct-linked routes to home', async () => {
    native.platform = 'android'; const router = makeRouter(); await router.push('/');
    const release = await connectNativeBack(router);
    native.callback(); expect(native.minimize).toHaveBeenCalledOnce();
    await router.push('/settings'); native.callback(); await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/'));
    release(); expect(native.remove).toHaveBeenCalledOnce();
  });
});
