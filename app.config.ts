import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  name: 'Salon App',
  slug: 'salon-app',
  scheme: 'salonapp',
  extra: {
    API_URL: process.env.API_URL ?? 'https://salon-service.onrender.com',
    APP_ENV: process.env.APP_ENV ?? 'development',
    TERMS_URL: process.env.TERMS_URL ?? 'https://example.com/terms',
    REQUEST_TIMEOUT_MS: Number(process.env.REQUEST_TIMEOUT_MS ?? 12000),
  },
});
