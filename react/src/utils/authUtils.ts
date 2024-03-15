import { AuthToken } from '../types';

export const AUTH_KEY = 'auth';

export function isTokenValid(authToken: AuthToken | null): boolean {
  if (authToken) {
    if (!authToken.expires) {
      return false;
    }

    const now = Date.now();
    return now < authToken.expires;
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
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }
  return { token: null, expires: null };
}

export function setTokenToLocalStorage(authToken: AuthToken) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(authToken));
}

export function removeTokenFromLocalStorage() {
  localStorage.removeItem(AUTH_KEY);
}
