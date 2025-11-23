import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.predictmaster.sportsai',
  appName: 'Ultimate Sports AI',
  webDir: 'web',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    hideUrlBar: false,
    cleartext: true,
    allowNavigation: [
      'ultimate-sports-ai-backend-production.up.railway.app',
      'js.stripe.com',
      'checkout.stripe.com',
      '*.stripe.com',
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'cdnjs.cloudflare.com',
      'play.rosebud.ai'
    ]
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'AAB'
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
