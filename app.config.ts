import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  name: 'Salon App',
  slug: 'salon-app',
  scheme: 'salonapp',
  extra: {
    API_URL: process.env.API_URL ?? 'https://example.com/api',
    APP_ENV: process.env.APP_ENV ?? 'development',
  },
});
