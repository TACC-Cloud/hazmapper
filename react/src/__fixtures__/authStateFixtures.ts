import { AuthState } from '../types';

export const authenticatedUser: AuthState = {
  user: {
    username: 'user',
    email: 'user@user.com',
  },
  authToken: {
    token: 'auth-token',
    expires: 3153600000000, // 2070
  },
};

export const unauthenticatedUser: AuthState = {
  user: null,
  authToken: null,
};
