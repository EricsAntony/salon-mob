import Constants from 'expo-constants';

type Extra = {
  API_URL?: string;
  TERMS_URL?: string;
  REQUEST_TIMEOUT_MS?: number;
};

const extra = (Constants?.expoConfig?.extra || {}) as Extra;

export const API_URL: string = extra.API_URL ?? 'https://salon-service.onrender.com';
export const TERMS_URL: string = extra.TERMS_URL ?? 'https://example.com/terms';
export const REQUEST_TIMEOUT_MS: number =
  typeof extra.REQUEST_TIMEOUT_MS === 'number' ? extra.REQUEST_TIMEOUT_MS : 12000;
