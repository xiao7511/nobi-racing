import type { CapacitorConfig } from '@capacitor/cli';
// Placeholder identifier. Verify ownership before generating signed native releases.
const config: CapacitorConfig = {
  appId: 'com.example.nobiracing',
  appName: 'NOBI Racing',
  webDir: 'dist',
  server: { androidScheme: 'https', cleartext: false },
};
export default config;
