export interface AuthenticatedUser {
  username: string;
}

export interface AuthToken {
  token: string;
  expiresAt: string;
}

export interface AuthState {
  user: AuthenticatedUser | null;
  authToken: AuthToken | null;
}
