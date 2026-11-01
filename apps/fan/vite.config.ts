import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
const target = process.env.NOBI_API_PROXY || 'http://127.0.0.1:5280';
const address = new URL(target);
if (address.protocol !== 'http:' || !['127.0.0.1','localhost'].includes(address.hostname) || address.username || address.password || address.pathname !== '/') throw Error('Local API proxy must target a loopback HTTP origin');
const base=process.env.NOBI_WEB_BASE||'/';if(!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base))throw Error('Invalid Web base path');
const proxy={target,changeOrigin:false,timeout:10000,proxyTimeout:10000,rewrite:(path:string)=>path.slice(base.length-1)};
export default defineConfig({base,plugins:[vue()],server:{port:5173,strictPort:true,proxy:{[base+'api/v1']:proxy}},preview:{proxy:{[base+'api/v1']:proxy}},build:{target:'es2022'}});
