import { requestJson } from './network';
import { refreshAccessToken } from './authRefresh';
import { store } from '../store';
import { setToken, logout } from '../store/slices/authSlice';
import { storage } from './storage';
import { AppError } from './errors';

async function enrichInitWithSession(
  init: RequestInit,
  token: string | null,
): Promise<RequestInit> {
  const headers = { ...(init.headers || {}) } as Record<string, string>;

  // Authorization
  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;

  // Fetch latest CSRF token and cookies from storage
  try {
    const csrfToken = (await storage.get<string>('auth.csrfToken')) || undefined;
    const cookieSaved = await storage.get<any>('auth.cookies');
    const cookieHeader = typeof cookieSaved === 'string' ? cookieSaved : cookieSaved?.setCookie;

    // Build cookies from Set-Cookie and ensure refresh_token/csrf_token are present
    let cookieStr = cookieHeader
      ? String(cookieHeader)
          .split(/,(?=[^;]+?=)/)
          .map((s) => s.split(';')[0].trim())
          .filter(Boolean)
          .join('; ')
      : '';

    const refreshToken = (await storage.get<string>('auth.refreshToken')) || undefined;
    if (refreshToken && !/\brefresh_token=/.test(cookieStr)) {
      cookieStr = cookieStr
        ? `${cookieStr}; refresh_token=${refreshToken}`
        : `refresh_token=${refreshToken}`;
    }
    if (csrfToken && !/\bcsrf_token=/.test(cookieStr)) {
      cookieStr = cookieStr ? `${cookieStr}; csrf_token=${csrfToken}` : `csrf_token=${csrfToken}`;
    }

    // Apply CSRF and Cookie if caller hasn't specified them
    if (csrfToken && !headers['X-CSRF-Token']) headers['X-CSRF-Token'] = String(csrfToken);
    if (cookieStr && !headers.Cookie) headers.Cookie = cookieStr;
  } catch {}

  return { ...init, headers };
}

async function getCurrentToken(): Promise<string | null> {
  const stateToken = store.getState().auth.token;
  if (stateToken) return stateToken;
  return (await storage.get<string>('auth.accessToken')) || null;
}

async function setNewToken(token: string) {
  store.dispatch(setToken(token));
  await storage.set('auth.accessToken', token);
}

async function handleAuthFailure(e: any): Promise<never> {
  try {
    await storage.remove('auth.accessToken');
    await storage.remove('auth.refreshToken');
  } catch {}
  store.dispatch(logout());
  const err: any = e;
  throw new AppError(
    err?.message || 'Session expired. Please sign in again.',
    'AUTH_EXPIRED',
    err?.status,
  );
}

export async function authedRequestJson<TResp = any>(
  method: string,
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<{ res: Response; data: TResp | null }> {
  let token = await getCurrentToken();
  try {
    const enriched = await enrichInitWithSession(init, token);
    return await requestJson<TResp>(method, url, enriched);
  } catch (e: any) {
    const status = e?.status;
    if (status !== 401 && status !== 403) throw e;

    // Try refresh once
    const newToken = await refreshAccessToken();
    if (!newToken) {
      return handleAuthFailure(e);
    }
    await setNewToken(newToken);
    token = newToken;

    try {
      const enriched = await enrichInitWithSession(init, token);
      return await requestJson<TResp>(method, url, enriched);
    } catch (e2) {
      return handleAuthFailure(e2);
    }
  }
}

export const authedGetJson = <TResp = any>(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
) => authedRequestJson<TResp>('GET', url, init);

export const authedPostJson = <TBody extends object = any, TResp = any>(
  url: string,
  body: TBody,
  init: RequestInit & { timeoutMs?: number } = {},
) => authedRequestJson<TResp>('POST', url, { ...init, body: body as any });

export const authedPutJson = <TBody extends object = any, TResp = any>(
  url: string,
  body: TBody,
  init: RequestInit & { timeoutMs?: number } = {},
) => authedRequestJson<TResp>('PUT', url, { ...init, body: body as any });

export const authedPatchJson = <TBody extends object = any, TResp = any>(
  url: string,
  body: TBody,
  init: RequestInit & { timeoutMs?: number } = {},
) => authedRequestJson<TResp>('PATCH', url, { ...init, body: body as any });

export const authedDeleteJson = <TBody extends object | undefined = undefined, TResp = any>(
  url: string,
  body?: TBody,
  init: RequestInit & { timeoutMs?: number } = {},
) =>
  authedRequestJson<TResp>(
    'DELETE',
    url,
    body === undefined ? init : ({ ...init, body: body as any } as any),
  );
