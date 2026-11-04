import {previousPage} from './lib/page-gestures';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import type { Router } from 'vue-router';
/** No native calls in Web. The listener is released with the Vue app. */
export async function connectNativeBack(router: Router): Promise<() => void> {
  if (Capacitor.getPlatform() !== 'android') return () => {};
  const listener = await App.addListener('backButton', () => {
    if (router.currentRoute.value.path === '/') void App.minimizeApp();
    else previousPage(router);
  });
  return () => { void listener.remove(); };
}
