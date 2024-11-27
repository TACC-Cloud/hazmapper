import React from 'react';
import { waitFor } from '@testing-library/react';
import Login from './Login';
import { renderInTest } from '../../test/testUtil';

beforeAll(() => {
  const mockLocation = {
    href: 'http://localhost:4200/login',
    hostname: 'localhost',
    pathname: '/login',
    assign: jest.fn(),
    replace: jest.fn(),
    // You can add other properties if needed
  };

  jest.spyOn(window, 'location', 'get').mockReturnValue(mockLocation as any);
});

afterAll(() => {
  jest.restoreAllMocks(); // Restore the original window.location after tests
});

test('renders login', async () => {
  const { getByText } = renderInTest(<Login />);
  expect(getByText(/Logging in/)).toBeDefined();

  await waitFor(() => {
    // Check that localStorage was set with the correct "toParam"
    expect(localStorage.getItem('toParam')).toBe('/');
    // Check that the mocked location was set correctly
    expect(window.location.href).toContain('geoapi');
  });
});
