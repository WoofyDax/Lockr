import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lockr.app',
  appName: 'Lockr',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#0f0a1e',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0f0a1e',
    allowsLinkPreview: false,
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f0a1e',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#a855f7',
      splashFullScreen: true,
      splashImmersive: true
    },
    Camera: {
      ios: {
        presentationStyle: 'fullscreen'
      }
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f0a1e'
    }
  }
};

export default config;
