const base=import.meta.env.BASE_URL||'/';
const remote=(import.meta.env.VITE_API_BASE_URL||'').replace(/\/$/,'');
if(remote){const url=new URL(remote);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||!/^\/[a-zA-Z0-9/_-]*$/.test(url.pathname))throw Error('API base must be an HTTPS URL without credentials or query');}
export const publicReference=import.meta.env.VITE_REFERENCE_MODE==='public';
export const apiUrl=(path:string)=>(remote?remote+'/':base)+path.replace(/^\//,'');
export const assetUrl=(path:string)=>base+path.replace(/^\//,'');
