import { BASE_API_URL } from '@configs/base.config';

export function apiFetch(input: string | URL, init?: RequestInit) {
  const url = input.toString();
  const baseUrl = BASE_API_URL.replace(/\/+$/, '');
  const absoluteUrl = /^https?:\/\//i.test(url) ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;

  return fetch(absoluteUrl, { ...init, credentials: init?.credentials ?? 'include' });
}
