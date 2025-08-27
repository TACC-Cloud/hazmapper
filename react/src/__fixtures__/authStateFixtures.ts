import { TAuthState } from '@hazmapper/hooks';

// Convert the timestamp to a Date object
const expiresAtDate = new Date(3153600000000); //2070

export const authenticatedUser: TAuthState = {
  username: 'test-user',
  authToken: {
    token: 'auth-token',
    expiresAt: expiresAtDate.toISOString(),
  },
  hasValidTapisToken: true,
  isAuthenticated: true,
};

export const unauthenticatedUser: TAuthState = {
  username: '',
  authToken: null,
  hasValidTapisToken: false,
  isAuthenticated: false,
};
