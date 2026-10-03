import { parseCookie, stringifySetCookie } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

type CookieOptions = {
  maxAge?: number;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
};

const DEFAULT_COOKIE_OPTIONS: Required<Pick<CookieOptions, 'maxAge' | 'path' | 'httpOnly'>> = {
  maxAge: 60 * 60 * 24, // 1 day in seconds
  path: '/',
  httpOnly: false,
};

export class CookiesStorageService {
  private readonly isServer: boolean;

  constructor(opts?: { isServer?: boolean }) {
    this.isServer = opts?.isServer ?? globalThis.window === undefined;
  }

  set(name: string, value: string, options: CookieOptions = {}) {
    if (this.isServer) {
      throw new Error('[CookiesStorageService] set() hanya bisa digunakan di client. Gunakan setServer() untuk SSR.');
    }

    document.cookie = stringifySetCookie({ name, value, ...DEFAULT_COOKIE_OPTIONS, ...options });
  }

  get(name: string): string | null {
    if (this.isServer) return null;
    const cookies = parseCookie(document.cookie || '');
    return cookies[name] || null;
  }

  delete(name: string) {
    if (this.isServer) return;

    document.cookie = stringifySetCookie({ name, value: '', maxAge: -1, path: '/' });
  }

  clear() {
    if (this.isServer) return;

    const cookies = parseCookie(document.cookie || '');
    for (const cookieName of Object.keys(cookies)) {
      document.cookie = stringifySetCookie({ name: cookieName, value: '', maxAge: -1, path: '/' });
    }
  }

  setJSON<T>(name: string, value: T, options?: CookieOptions) {
    this.set(name, JSON.stringify(value), options);
  }

  getJSON<T>(name: string): T | null {
    const raw = this.get(name);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn(`[CookiesStorageService] Failed to parse JSON for key "${name}", clearing it`, error);
      return null;
    }
  }

  getServer(req: NextApiRequest | { headers: { cookie?: string } }, name: string): string | null {
    const cookies = parseCookie(req?.headers?.cookie || '');
    return cookies[name] || null;
  }

  setServer(res: NextApiResponse, name: string, value: string, options: CookieOptions = {}) {
    const cookieStr = stringifySetCookie({
      name,
      value,
      ...DEFAULT_COOKIE_OPTIONS,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      ...options,
    });

    const existing = res.getHeader('Set-Cookie');
    let cookies: string[] = [];
    if (Array.isArray(existing)) {
      cookies = existing;
    } else if (existing) {
      cookies = [existing.toString()];
    }

    res.setHeader('Set-Cookie', [...cookies, cookieStr]);
  }

  deleteServer(res: NextApiResponse, name: string) {
    const cookieStr = stringifySetCookie({
      name,
      value: '',
      path: '/',
      maxAge: -1,
    });

    res.setHeader('Set-Cookie', cookieStr);
  }

  clearServer(req: NextApiRequest, res: NextApiResponse) {
    const cookies = parseCookie(req?.headers?.cookie || '');
    const cleared = Object.keys(cookies).map((cookieName) =>
      stringifySetCookie({
        name: cookieName,
        value: '',
        path: '/',
        maxAge: -1,
      })
    );

    res.setHeader('Set-Cookie', cleared);
  }
}
