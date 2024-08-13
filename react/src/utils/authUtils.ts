import { AuthToken, AuthState } from '../types';

export const AUTH_KEY = 'authV3';

export function isTokenValid(authToken: AuthToken | null): boolean {
  if (authToken) {
    if (!authToken.expiresAt) {
      return false;
    }

    const now = new Date();
    const expiresAtDate = new Date(authToken.expiresAt);
    return now < expiresAtDate;
  } else {
    return false;
  }
}

/**
 * Retrieves the authentication information (user, token etc) from local storage.
 *
 * If not found in local storage, the function returns `null`.
 */
export function getAuthenticatedUserFromLocalStorage(): AuthState {
  try {
    const authenticatedUserJson = localStorage.getItem(AUTH_KEY);
    if (authenticatedUserJson) {
      const authState = JSON.parse(authenticatedUserJson);
      return authState;
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }
  return { user: null, authToken: null };
}

export function setAuthenticatedUserFromLocalStorage(authToken: AuthState) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(authToken));
}

export function removeAuthenticatedUserFromLocalStorage() {
  localStorage.removeItem(AUTH_KEY);
}
