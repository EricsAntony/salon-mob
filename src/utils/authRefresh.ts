import { API_URL } from './env';
import { fetchWithTimeout, parseJsonSafe } from './network';
import { storage } from './storage';
import { AppError } from './errors';

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const csrfToken = await storage.get<string>('auth.csrfToken');
    const cookieSaved = await storage.get<any>('auth.cookies');
    const cookieHeader = typeof cookieSaved === 'string' ? cookieSaved : cookieSaved?.setCookie;

    // Build existing cookies from saved Set-Cookie header
    const cookieStrFromSetCookie = cookieHeader
      ? String(cookieHeader)
          .split(/,(?=[^;]+?=)/)
          .map((s) => s.split(';')[0].trim())
          .filter(Boolean)
          .join('; ')
      : '';

    // Ensure refresh_token cookie present if we parsed it before
    const refreshToken = await storage.get<string>('auth.refreshToken');
    let cookieStr = cookieStrFromSetCookie;
    if (refreshToken && !/\brefresh_token=/.test(cookieStr)) {
      cookieStr = cookieStr
        ? `${cookieStr}; refresh_token=${refreshToken}`
        : `refresh_token=${refreshToken}`;
    }

    // Ensure csrf_token cookie present if we parsed it before
    if (csrfToken && !/\bcsrf_token=/.test(cookieStr)) {
      cookieStr = cookieStr ? `${cookieStr}; csrf_token=${csrfToken}` : `csrf_token=${csrfToken}`;
    }

    const phone = (await storage.get<string>('auth.phoneNumber')) || '';

    const url = `${API_URL}/auth/refresh`;
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        ...(csrfToken ? { 'X-CSRF-Token': String(csrfToken) } : {}),
        ...(cookieStr ? { Cookie: cookieStr } : {}),
      },
      body: JSON.stringify({ phone_number: phone }),
      // credentials not supported by RN fetch; using Cookie header instead
    });

    const data = await parseJsonSafe<any>(res);
    if (!res.ok || (data as any)?.success === false) {
      throw new AppError(
        data?.error?.message || 'Refresh failed',
        data?.error?.type || 'REFRESH_FAILED',
        res.status,
      );
    }

    // Capture new tokens/cookies
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      await storage.set('auth.cookies', { setCookie });
      const parts = String(setCookie).split(/,(?=[^;]+?=)/);
      const getCookie = (name: string): string | undefined => {
        for (const p of parts) {
          const kv = p.split(';')[0];
          const eq = kv.indexOf('=');
          if (eq > -1) {
            const k = kv.slice(0, eq).trim();
            if (k.toLowerCase() === name.toLowerCase()) return kv.slice(eq + 1).trim();
          }
        }
        return undefined;
      };
      const refreshFromCookie =
        getCookie('refresh_token') || getCookie('refreshToken') || getCookie('rt');
      const csrfFromCookie =
        getCookie('csrf_token') ||
        getCookie('csrfToken') ||
        getCookie('xsrf-token') ||
        getCookie('XSRF-TOKEN');
      if (refreshFromCookie) await storage.set('auth.refreshToken', refreshFromCookie);
      if (csrfFromCookie) await storage.set('auth.csrfToken', csrfFromCookie);
    }

    const newAccess = data?.access_token || data?.accessToken || data?.token || null;
    if (newAccess) {
      await storage.set('auth.accessToken', newAccess);
      return String(newAccess);
    }
    return null;
  } catch (e) {
    return null;
  }
}
