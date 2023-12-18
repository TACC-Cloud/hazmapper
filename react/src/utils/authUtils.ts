import { AuthToken } from '../types';

export const AUTH_KEY = 'auth';

export function isTokenValid(token: AuthToken | null): boolean {
  if (token) {
    if (!token.expires) {
      return false;
    }

    const now = Date.now();
    return now < token.expires;
  } else {
    return false;
  }
}

export function getTokenFromLocalStorage(): AuthToken {
  try {
    const tokenStr = localStorage.getItem(AUTH_KEY);
    if (tokenStr) {
      const auth = JSON.parse(tokenStr);
      return auth;
    }
  } catch (e: any) {
    console.error('Error loading state from localStorage:', e);
  }
  return { token: null, expires: null };
}

export function setTokenToLocalStorage(token: AuthToken) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(token));
}

export function removeTokenFromLocalStorage() {
  localStorage.removeItem(AUTH_KEY);
}
