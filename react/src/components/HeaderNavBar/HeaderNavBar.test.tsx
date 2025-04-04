import React from 'react';
import { fireEvent } from '@testing-library/react';
import * as ROUTES from '@hazmapper/constants/routes';
import { renderInTest } from '@hazmapper/test/testUtil';
import { HeaderNavBar } from './HeaderNavBar';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    pathname: '/project-public/cd010f4d-3975-4fde-8bbd-b81ffb87273f',
  }),
}));

const mockAuthenticatedUser = {
  username: '',
  hasValidTapisToken: false,
};

jest.mock('@hazmapper/hooks/user/useAuthenticatedUser', () => {
  return {
    __esModule: true,
    default: () => {
      return { ...mockAuthenticatedUser };
    },
  };
});

describe('HeaderNavBar', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockAuthenticatedUser.username = '';
  });

  test('clicking login button should navigate to login with correct return URL', () => {
    const { getByText } = renderInTest(<HeaderNavBar />);

    const loginButton = getByText('Login');
    fireEvent.click(loginButton);

    const expectedPath = '/project-public/cd010f4d-3975-4fde-8bbd-b81ffb87273f';
    const expectedUrl = `${ROUTES.LOGIN}?to=${encodeURIComponent(
      expectedPath
    )}`;

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(expectedUrl);
    expect(mockNavigate).not.toHaveBeenCalledWith(ROUTES.MAIN);
  });

  test('clicking header should navigate to main', () => {
    const { getByRole } = renderInTest(<HeaderNavBar />);

    const header = getByRole('button', { name: 'return to project listings' });
    fireEvent.click(header);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MAIN);
  });

  test('displays username when user is authenticated', () => {
    Object.assign(mockAuthenticatedUser, {
      username: 'testUser',
    });

    const { getByText, queryByText } = renderInTest(<HeaderNavBar />);

    expect(getByText('testUser')).toBeDefined();
    expect(queryByText('Login')).toBeNull();
  });
});
