import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
const target = process.env.NOBI_API_PROXY || 'http://127.0.0.1:5280';
const address = new URL(target);
if (address.protocol !== 'http:' || !['127.0.0.1','localhost'].includes(address.hostname) || address.username || address.password || address.pathname !== '/') throw Error('Local API proxy must target a loopback HTTP origin');
export default defineConfig({ plugins: [vue()], server: { port: 5173, strictPort: true, proxy: { '/api/v1': { target, changeOrigin: false, timeout: 10000, proxyTimeout: 10000 } } }, preview: { proxy: { '/api/v1': { target, changeOrigin: false } } }, build: { target: 'es2022' } });
