export interface AuthToken {
  token: string;
  expiresAt: string;
}

export interface AuthState {
  username: string;
  authToken: AuthToken | null;
  hasValidTapisToken: boolean;
  isAuthenticated: boolean;
}
