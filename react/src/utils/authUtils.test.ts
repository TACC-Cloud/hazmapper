import { isTokenValid } from './authUtils';
import { AuthToken } from '@hazmapper/types';

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
});
