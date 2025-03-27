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
      'X-Geoapi-Application': 'hazmapper',
      'X-Geoapi-IsPublicView': 'False',
    });
  });

  it('returns no auth-related headers for unauthenticatedUser', () => {
    const headers = getHeaders(ApiService.Geoapi, unauthenticatedUser);
    expect(headers).toEqual({
      'X-Geoapi-Application': 'hazmapper',
      'X-Geoapi-IsPublicView': 'False',
      'X-Guest-UUID': expect.any(String), // UUID is dynamic
    });
  });

  it('returns analytics headers for Geoapi', () => {
    const headers = getHeaders(ApiService.Geoapi, authenticatedUser);
    expect(headers).toMatchObject({
      'X-Geoapi-Application': 'hazmapper',
      'X-Geoapi-IsPublicView': 'False',
    });
  });

  it('returns Authorization header for Mapillary', () => {
    const headers = getHeaders(ApiService.Mapillary, authenticatedUser, '1234');
    expect(headers).toEqual({
      authorization: `OAuth 1234`,
    });
  });
});
