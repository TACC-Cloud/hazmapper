import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Login from './Login';
import { Provider } from 'react-redux';
import store from '../../redux/store';
import { QueryClientProvider } from 'react-query';
import { testQueryClient } from '../../testUtil';
import { MemoryRouter } from 'react-router';

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
    expect(localStorage.getItem('authState')).not.toBeNull();
  });
});
