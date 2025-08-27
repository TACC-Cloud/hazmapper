import { getHeaders, usesTapisToken } from './requests';
import { ApiService } from '@hazmapper/types';
import {
  authenticatedUser,
  unauthenticatedUser,
} from './__fixtures__/authStateFixtures';

describe('getHeaders', () => {
  it('returns Authorization header for Geoapi', () => {
    const apiService = ApiService.Geoapi;
    const isTapisTokenRequest = usesTapisToken(apiService);
    const headers = getHeaders({
      apiService,
      isTapisTokenRequest,
      authToken: authenticatedUser.authToken,
    });
    expect(headers).toEqual({
      'X-Geoapi-Application': 'hazmapper',
      'X-Geoapi-IsPublicView': 'False',
    });
  });

  it('returns no auth-related headers for unauthenticatedUser', () => {
    const apiService = ApiService.Geoapi;
    const isTapisTokenRequest = usesTapisToken(apiService);
    const headers = getHeaders({
      apiService,
      isTapisTokenRequest,
      authToken: unauthenticatedUser.authToken,
    });
    expect(headers).toEqual({
      'X-Geoapi-Application': 'hazmapper',
      'X-Geoapi-IsPublicView': 'False',
      'X-Guest-UUID': expect.any(String), // UUID is dynamic
    });
  });

  it('returns analytics headers for Geoapi', () => {
    const apiService = ApiService.Geoapi;
    const isTapisTokenRequest = usesTapisToken(apiService);
    const headers = getHeaders({
      apiService,
      isTapisTokenRequest,
      authToken: authenticatedUser.authToken,
    });
    expect(headers).toMatchObject({
      'X-Geoapi-Application': 'hazmapper',
      'X-Geoapi-IsPublicView': 'False',
    });
  });

  it('returns Authorization header for Mapillary', () => {
    const apiService = ApiService.Mapillary;
    const isTapisTokenRequest = usesTapisToken(apiService);
    const headers = getHeaders({
      apiService,
      isTapisTokenRequest,
      authToken: authenticatedUser.authToken,
      mapillaryAuthToken: '1234',
    });
    expect(headers).toEqual({
      authorization: `OAuth 1234`,
    });
  });
});
