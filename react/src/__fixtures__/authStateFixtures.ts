import { AuthState } from '@hazmapper/types';

// Convert the timestamp to a Date object
const expiresAtDate = new Date(3153600000000); //2070

export const authenticatedUser: AuthState = {
  username: 'test-user',
  authToken: {
    token: 'auth-token',
    expiresAt: expiresAtDate.toISOString(),
  },
  hasValidTapisToken: true,
  isAuthenticated: true,
};

export const unauthenticatedUser: AuthState = {
  username: '',
  authToken: null,
  hasValidTapisToken: false,
  isAuthenticated: false,
};
