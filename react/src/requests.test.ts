import { getHeaders } from './requests';
import { ApiService } from '@hazmapper/types';
import {
  authenticatedUser,
  unauthenticatedUser,
} from './__fixtures__/authStateFixtures';

describe('getHeaders', () => {
  it('returns Authorization header for Geoapi', () => {
    const headers = getHeaders(ApiService.Geoapi, authenticatedUser);
    expect(headers).toEqual({
      'X-Tapis-Token': `${authenticatedUser.authToken?.token}`,
    });
  });

  it('returns no auth-related headers for unauthenticatedUser', () => {
    const headers = getHeaders(ApiService.Geoapi, unauthenticatedUser);
    expect(headers).toEqual({});
  });
});
