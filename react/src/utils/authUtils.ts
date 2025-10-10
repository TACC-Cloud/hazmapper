import { AuthToken } from '@hazmapper/types';

export function isTokenValid(authToken: AuthToken | null): boolean {
  if (authToken) {
    if (!authToken.expiresAt) {
      return false;
    }

    const now = new Date();
    const expiresAtDate: Date = new Date(authToken.expiresAt);
    return now < expiresAtDate;
  } else {
    return false;
  }
}
