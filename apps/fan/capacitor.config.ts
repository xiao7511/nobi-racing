import type { CapacitorConfig } from '@capacitor/cli';
const appId=process.env.NOBI_APP_ID||'com.nobistudio.racing';
if(!/^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*){2,}$/.test(appId))throw Error('Invalid application identifier');
const config: CapacitorConfig = {
  appId,
  appName: 'NOBI Racing',
  webDir: 'dist',
  server: { androidScheme: 'https', cleartext: false },
};
export default config;
