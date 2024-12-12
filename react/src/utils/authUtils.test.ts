import {
  isTokenValid,
  getAuthenticatedUserFromLocalStorage,
  setAuthenticatedUserFromLocalStorage,
  removeAuthenticatedUserFromLocalStorage,
  AUTH_KEY,
} from './authUtils';
import { AuthState, AuthToken } from '@hazmapper/types';

describe('Auth Utils', () => {
  describe('isTokenValid', () => {
    it('should return false if authToken is null', () => {
      expect(isTokenValid(null)).toBe(false);
    });

    it('should return false if token is expired', () => {
      const authToken: AuthToken = {
        token: 'fakeToken',
        expiresAt: new Date(Date.now() - 1000).toISOString(), // Expired 1 second ago
      };
      expect(isTokenValid(authToken)).toBe(false);
    });

    it('should return true if token is valid', () => {
      const authToken: AuthToken = {
        token: 'fakeToken',
        expiresAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // Expires in 10 minutes
      };
      expect(isTokenValid(authToken)).toBe(true);
    });
  });

  describe('getAuthenticatedUserFromLocalStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should return null user and token if localStorage is empty', () => {
      const result = getAuthenticatedUserFromLocalStorage();
      expect(result).toEqual({ user: null, authToken: null });
    });

    it('should return the user and token from localStorage', () => {
      const authState: AuthState = {
        user: { username: 'testUser' },
        authToken: { token: 'fakeToken', expiresAt: '2024-12-31T23:59:59Z' },
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(authState));

      const result = getAuthenticatedUserFromLocalStorage();
      expect(result).toEqual(authState);
    });
  });

  describe('setAuthenticatedUserFromLocalStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should store the user and token in localStorage', () => {
      const authState: AuthState = {
        user: { username: 'testUser' },
        authToken: { token: 'fakeToken', expiresAt: '2024-12-31T23:59:59Z' },
      };

      setAuthenticatedUserFromLocalStorage(authState);
      const storedValue = localStorage.getItem(AUTH_KEY);
      expect(storedValue).toEqual(JSON.stringify(authState));
    });
  });

  describe('removeAuthenticatedUserFromLocalStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should remove the user and token from localStorage', () => {
      const authState: AuthState = {
        user: { username: 'testUser' },
        authToken: { token: 'fakeToken', expiresAt: '2024-12-31T23:59:59Z' },
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(authState));

      removeAuthenticatedUserFromLocalStorage();
      const storedValue = localStorage.getItem(AUTH_KEY);
      expect(storedValue).toBeNull();
    });
  });
});
