import { REQUEST_TIMEOUT_MS } from './env';
import { AppError, fromApiError } from './errors';

export async function fetchWithTimeout(
  resource: RequestInfo | URL,
  options: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = REQUEST_TIMEOUT_MS, ...init } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  // If caller provided an external signal, propagate its abort to our controller
  const externalSignal: AbortSignal | undefined = (options as any).signal as any;
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }

  try {
    const res = await fetch(resource as any, { ...init, signal: controller.signal });
    return res;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new AppError('Request timed out. Please try again.', 'REQUEST_TIMEOUT', 408);
    }
    throw err;
  } finally {
    clearTimeout(id);
    if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort as any);
  }
}

export async function parseJsonSafe<T = any>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function postJson<TBody extends object = any, TResp = any>(
  url: string,
  body: TBody,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<{ res: Response; data: TResp | null }> {
  const headers = {
    'Content-Type': 'application/json',
    ...(init.headers || {}),
  } as Record<string, string>;

  const res = await fetchWithTimeout(url, {
    ...init,
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await parseJsonSafe<TResp>(res);
  if (!res.ok || (data as any)?.success === false) {
    throw fromApiError(data as any, res.status);
  }
  return { res, data };
}

// General JSON request helper
export async function requestJson<TResp = any>(
  method: string,
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<{ res: Response; data: TResp | null }> {
  const headers = {
    ...(init.headers || {}),
  } as Record<string, string>;

  let body: any = (init as any).body;
  const hasBody = body !== undefined;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (hasBody && !isFormData && typeof body !== 'string') {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    body = JSON.stringify(body);
  }

  const res = await fetchWithTimeout(url, {
    ...init,
    method: method.toUpperCase(),
    headers,
    ...(hasBody ? { body } : {}),
  });

  const data = await parseJsonSafe<TResp>(res);
  if (!res.ok || (data as any)?.success === false) {
    throw fromApiError(data as any, res.status);
  }
  return { res, data };
}

export async function getJson<TResp = any>(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<{ res: Response; data: TResp | null }> {
  return requestJson<TResp>('GET', url, init);
}

export async function putJson<TBody extends object = any, TResp = any>(
  url: string,
  body: TBody,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<{ res: Response; data: TResp | null }> {
  return requestJson<TResp>('PUT', url, { ...init, body: body as any });
}

export async function patchJson<TBody extends object = any, TResp = any>(
  url: string,
  body: TBody,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<{ res: Response; data: TResp | null }> {
  return requestJson<TResp>('PATCH', url, { ...init, body: body as any });
}

export async function deleteJson<TBody extends object | undefined = undefined, TResp = any>(
  url: string,
  body?: TBody,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<{ res: Response; data: TResp | null }> {
  const finalInit = body === undefined ? init : ({ ...init, body: body as any } as any);
  return requestJson<TResp>('DELETE', url, finalInit);
}
