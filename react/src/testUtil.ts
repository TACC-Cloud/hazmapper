import { QueryClient } from 'react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';

// TODO move mocks from unit test into handlers

export const server = setupServer(
  // Fixture being added in https://github.com/TACC-Cloud/hazmapper/pull/273
  http.post(`${testDevConfiguration.geoapiUrl}/projects/`, () => {
    return HttpResponse.json({ uuid: 123 }, { status: 200 });
  })
);

export const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
      // Make React Query throw errors
      useErrorBoundary: true,
    },
  },
});
