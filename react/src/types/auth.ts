export interface AuthenticatedUser {
  username: string;
  email: string;
}

export interface AuthToken {
  token: string | null;
  expires: number | null;
}

export interface AuthState {
  user: AuthenticatedUser | null;
  authToken: AuthToken | null;
}
