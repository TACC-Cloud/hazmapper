import { AuthState } from '../redux/authSlice';

export const AUTH_KEY = 'auth';

export function isTokenValid(auth: AuthState): boolean {
  if (!auth.expires) {
    return false;
  }

  const now = Date.now();
  return now < auth.expires;
}

export function getAuthFromLocalStorage(): AuthState {
  try {
    const tokenStr = localStorage.getItem(AUTH_KEY);
    if (tokenStr) {
      const auth = JSON.parse(tokenStr);
      return { token: auth.token, expires: auth.expires };
    }
  } catch (e: any) {
    console.error('Error loading state from localStorage:', e);
  }
  return { token: null, expires: null };
}

export function setAuthToLocalStorage(auth: AuthState) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function removeAuthFromLocalStorage() {
  localStorage.removeItem(AUTH_KEY);
}
