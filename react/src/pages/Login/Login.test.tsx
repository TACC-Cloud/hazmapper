import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Login from './Login';
import { Provider } from 'react-redux';
import store from '../../redux/store';
import { QueryClientProvider } from 'react-query';
import { testQueryClient } from '../../test/testUtil';
import { MemoryRouter } from 'react-router';

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
  const { getByText } = render(
    <Provider store={store}>
      <MemoryRouter>
        <QueryClientProvider client={testQueryClient}>
          <Login />
        </QueryClientProvider>
      </MemoryRouter>
    </Provider>
  );
  expect(getByText(/Logging in/)).toBeDefined();

  await waitFor(() => {
    // Check that localStorage was set with the correct "toParam"
    expect(localStorage.getItem('toParam')).toBe('/');
    // Check that the mocked location was set correctly
    expect(window.location.href).toContain('geoapi');
  });
});
