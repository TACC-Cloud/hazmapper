import { getHeaders } from './requests';
import { ApiService, GeoapiBackendEnvironment } from './types';
import {
  authenticatedUser,
  unauthenticatedUser,
} from './__fixtures__/authStateFixtures';
import { localDevConfiguration } from './__fixtures__/appConfigurationFixture';

describe('getHeaders', () => {
  it('returns Authorization header for Geoapi', () => {
    const headers = getHeaders(
      ApiService.Geoapi,
      {
        ...localDevConfiguration,
        geoapiBackend: GeoapiBackendEnvironment.Production, // Or any other environment
      },
      authenticatedUser
    );
    expect(headers).toEqual({
      'X-Tapis-Token': `${authenticatedUser.authToken?.token}`,
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
