import { getHeaders } from './requests';
import { ApiService, GeoapiBackendEnvironment } from './types';
import {
  authenticatedUser,
  unauthenticatedUser,
} from './__fixtures__/authStateFixtures';
import { localDevConfiguration } from './__fixtures__/appConfigurationFixture';

describe('getHeaders', () => {
  it('returns JWT header when using local Geoapi', () => {
    const headers = getHeaders(
      ApiService.Geoapi,
      {
        ...localDevConfiguration,
        geoapiBackend: GeoapiBackendEnvironment.Local,
      },
      authenticatedUser
    );

    expect(headers).toEqual({
      'X-JWT-Assertion-designsafe': localDevConfiguration.jwt,
    });
  });

  it('returns Authorization header for non-local Geoapi', () => {
    const headers = getHeaders(
      ApiService.Geoapi,
      {
        ...localDevConfiguration,
        geoapiBackend: GeoapiBackendEnvironment.Production, // Or any other non-local environment
      },
      authenticatedUser
    );
    expect(headers).toEqual({
      Authorization: `Bearer ${authenticatedUser.authToken?.token}`,
    });
  });

  it('returns no auth-related headers for unauthenticatedUser', () => {
    const headers = getHeaders(
      ApiService.Geoapi,
      localDevConfiguration,
      unauthenticatedUser
    );
    expect(headers).toEqual({});
  });
});
