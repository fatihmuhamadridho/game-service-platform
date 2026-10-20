'use client';

import { useEffect } from 'react';

const sessionKey = 'jokihub-session-type';
const refreshIntervalMs = 8 * 60 * 1000;

type AccountType = 'CUSTOMER' | 'ADMIN';

const hasRefreshCookieHint = (type: AccountType) =>
  document.cookie.split(';').some((cookie) => cookie.trim() === `jokihub-${type.toLowerCase()}-refresh-present=1`);

export function AuthSessionRefresher() {
  useEffect(() => {
    let lastRefreshAt = Date.now();
    let active = true;

    const refresh = async (accountType: AccountType): Promise<boolean | null> => {
      if (!hasRefreshCookieHint(accountType)) return false;
      const lockKey = `jokihub-refresh-lock-${accountType.toLowerCase()}`;
      const now = Date.now();
      const lockOwner = `${now}-${Math.random().toString(36).slice(2)}`;
      const lockValue = `${lockOwner}:${now + 20_000}`;
      try {
        const [activeOwner, expiryText] = (window.localStorage.getItem(lockKey) ?? '').split(':');
        if (activeOwner && Number(expiryText) > now) return null;
        window.localStorage.setItem(lockKey, lockValue);
      } catch {
        // Storage can be disabled; the endpoint still enforces single-use token rotation.
      }

      try {
        const endpoint = accountType === 'ADMIN' ? '/api/admin/auth/v1/refresh-token' : '/api/auth/v1/refresh-token';
        const response = await fetch(endpoint, { method: 'POST', cache: 'no-store' });
        if (response.ok) {
          lastRefreshAt = Date.now();
          window.sessionStorage.setItem(sessionKey, accountType);
          window.localStorage.setItem(sessionKey, accountType);
          return true;
        }
        if (response.status === 401) {
          window.sessionStorage.removeItem(sessionKey);
          window.localStorage.removeItem(sessionKey);
          window.dispatchEvent(new Event('jokihub:session-ended'));
        }
        else return null;
      } catch {
        // Keep current access session; next timer/focus event retries while refresh token remains valid.
        return null;
      } finally {
        try {
          if (window.localStorage.getItem(lockKey) === lockValue) window.localStorage.removeItem(lockKey);
        } catch {
          // Ignore storage cleanup failures.
        }
      }
      return false;
    };

    const refreshExpiredLogin = () => {
      const requested = new URLSearchParams(window.location.search).get('refresh');
      if (requested !== 'admin' && requested !== 'customer') return false;
      const type = requested === 'admin' ? 'ADMIN' : 'CUSTOMER';
      if (!hasRefreshCookieHint(type)) {
        window.history.replaceState(null, '', '/login');
        return false;
      }
      void refresh(type).then((ok) => {
        if (!active) return;
        if (ok === null) {
          window.setTimeout(() => {
            if (!active) return;
            void refresh(type).then((retry) => {
              if (!active) return;
              window.location.replace(retry ? (type === 'ADMIN' ? '/admin' : '/') : '/login');
            });
          }, 1000);
          return;
        }
        window.location.replace(ok ? (type === 'ADMIN' ? '/admin' : '/') : '/login');
      });
      return true;
    };

    if (refreshExpiredLogin())
      return () => {
        active = false;
      };

    const refreshCurrentSession = () => {
      if (Date.now() - lastRefreshAt < refreshIntervalMs) return;
      const type = window.sessionStorage.getItem(sessionKey);
      if ((type === 'ADMIN' || type === 'CUSTOMER') && hasRefreshCookieHint(type)) void refresh(type);
      else if (type === 'ADMIN' || type === 'CUSTOMER') window.sessionStorage.removeItem(sessionKey);
      lastRefreshAt = Date.now();
    };
    const timer = window.setInterval(refreshCurrentSession, refreshIntervalMs);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refreshCurrentSession();
    };
    const onSessionEstablished = (event: Event) => {
      const type = (event as CustomEvent<AccountType>).detail;
      if (type === 'ADMIN' || type === 'CUSTOMER') {
        window.sessionStorage.setItem(sessionKey, type);
        lastRefreshAt = Date.now();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('jokihub:session-established', onSessionEstablished);
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('jokihub:session-established', onSessionEstablished);
    };
  }, []);

  return null;
}
