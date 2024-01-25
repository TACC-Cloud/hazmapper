export interface AuthenticatedUser {
  username: string | null;
  email: string | null;
}

export interface AuthToken {
  token: string | null;
  expires: number | null;
}

export interface AuthState {
  user: AuthenticatedUser | null;
  token: AuthToken | null;
}
