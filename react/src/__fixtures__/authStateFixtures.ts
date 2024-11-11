import { AuthState } from '@hazmapper/types';

// Convert the timestamp to a Date object
const expiresAtDate = new Date(3153600000000); //2070

export const authenticatedUser: AuthState = {
  user: {
    username: 'user',
  },
  authToken: {
    token: 'auth-token',
    expiresAt: expiresAtDate.toISOString(),
  },
};

export const unauthenticatedUser: AuthState = {
  user: null,
  authToken: null,
};
