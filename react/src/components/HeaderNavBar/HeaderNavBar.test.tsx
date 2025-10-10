import React, { act } from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { http, HttpResponse } from 'msw';
import * as ROUTES from '@hazmapper/constants/routes';
import { renderInTest, server } from '@hazmapper/test/testUtil';
import { HeaderNavBar } from './HeaderNavBar';
import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';
import {
  authenticatedUser,
  unauthenticatedUser,
} from '@hazmapper/__fixtures__/authStateFixtures';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    pathname: '/project-public/cd010f4d-3975-4fde-8bbd-b81ffb87273f',
  }),
}));

describe('HeaderNavBar', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('clicking login button should navigate to login with correct return URL', async () => {
    server.use(
      http.get(`${testDevConfiguration.geoapiUrl}/auth/user/`, () =>
        HttpResponse.json(unauthenticatedUser, { status: 200 })
      )
    );
    let getByText;
    await act(async () => {
      ({ getByText } = renderInTest(<HeaderNavBar />));
    });
    const loginButton = getByText('Login');
    fireEvent.click(loginButton);

    const expectedPath = '/project-public/cd010f4d-3975-4fde-8bbd-b81ffb87273f';
    const expectedUrl = `${ROUTES.LOGIN}?to=${encodeURIComponent(expectedPath)}`;

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(expectedUrl);
      expect(mockNavigate).not.toHaveBeenCalledWith(ROUTES.MAIN);
    });
  });

  test('clicking header should navigate to main', async () => {
    let getByRole;
    await act(async () => {
      ({ getByRole } = renderInTest(<HeaderNavBar />));
    });
    const header = getByRole('link', { name: 'return to project listings' });
    expect(header).toHaveAttribute('href', ROUTES.MAIN);
  });

  test('displays username when user is authenticated', async () => {
    let getByText, queryByText;
    await act(async () => {
      ({ getByText, queryByText } = renderInTest(<HeaderNavBar />));
    });

    await waitFor(() => {
      expect(getByText(authenticatedUser.username)).toBeDefined();
      expect(queryByText('Login')).toBeNull();
    });
  });
});
