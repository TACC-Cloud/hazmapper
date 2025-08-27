import React from 'react';
import { waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import MapProject from './MapProject';
import {
  server,
  renderInTestWaitForQueries,
  renderInTest,
  testQueryClient,
} from '@hazmapper/test/testUtil';
import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';
import { unauthenticatedUser } from '@hazmapper/__fixtures__/authStateFixtures';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom') as object;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ projectUUID: 'test-uuid' }),
    useLocation: () => ({ pathname: '/test-path', search: '' }),
  };
});

describe('MapProject', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    testQueryClient.clear();
  });

  test('shows loading spinner initially', async () => {
    server.use(
      http.get(`${testDevConfiguration.geoapiUrl}/projects/`, () => {
        return new Promise(() => {}); // Never resolves to keep loading state
      })
    );

    let getByRole;
    await act(async () => {
      ({ getByRole } = renderInTest(<MapProject />));
    });

    await waitFor(() => {
      expect(getByRole('status')).toBeDefined();
    });
  });

  test('shows 404 error when project does not exist', async () => {
    server.use(
      http.get(`${testDevConfiguration.geoapiUrl}/projects/`, async () => {
        return new HttpResponse(null, {
          status: 404,
          statusText: 'Not Found',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      })
    );

    const { queryByText } = await renderInTestWaitForQueries(<MapProject />);

    await waitFor(() => {
      expect(queryByText('This map project does not exist')).toBeDefined();
    });
  });

  test('shows 403 error for unauthorized access when logged in', async () => {
    server.use(
      http.get(`${testDevConfiguration.geoapiUrl}/projects/`, async () => {
        return new HttpResponse(null, {
          status: 403,
          statusText: 'Forbidden',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      })
    );

    const { queryByText } = await renderInTestWaitForQueries(<MapProject />);

    await waitFor(() => {
      expect(
        queryByText("You don't have permission to access this map project")
      ).toBeDefined();
    });
  });

  test('shows login prompt for 403 error when not logged in', async () => {
    server.use(
      http.get(`${testDevConfiguration.geoapiUrl}/projects/`, async () => {
        return new HttpResponse(null, {
          status: 403,
          statusText: 'Forbidden',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }),

      http.get(`${testDevConfiguration.geoapiUrl}/auth/user/`, () =>
        HttpResponse.json(unauthenticatedUser, { status: 200 })
      )
    );

    const { queryByText, queryByTestId } = await renderInTestWaitForQueries(
      <MapProject />
    );

    expect(queryByText('Please log in.')).toBeDefined();
    const button = queryByTestId('access-error-login-button');
    expect(button).toBeDefined();

    if (button) {
      button.click();
    }
    expect(mockNavigate).toHaveBeenCalledWith(
      `/login?to=${encodeURIComponent('/test-path')}`
    );
  });

  test('shows generic error for server error', async () => {
    server.use(
      http.get(`${testDevConfiguration.geoapiUrl}/projects/`, async () => {
        return new HttpResponse(null, {
          status: 500,
          statusText: 'Internal Server Error',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      })
    );

    const { queryByText } = await renderInTestWaitForQueries(<MapProject />);

    await waitFor(() => {
      expect(
        queryByText('Unable to load map project due to a server error')
      ).toBeDefined();
    });
  });
});
