import Constants from 'expo-constants';

export const config = {
  API_URL: (Constants?.expoConfig?.extra as any)?.API_URL || 'https://example.com/api',
  APP_ENV: (Constants?.expoConfig?.extra as any)?.APP_ENV || 'development',
};
