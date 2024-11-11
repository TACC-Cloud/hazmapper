import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import MainMenu from './MainMenu';
import { QueryClientProvider } from 'react-query';
import { testQueryClient, server } from '@hazmapper/test/testUtil';
import { Provider } from 'react-redux';
import store from '../../redux/store';
import { MemoryRouter } from 'react-router-dom';
import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';
import { systems } from '@hazmapper/__fixtures__/systemsFixture';

jest.mock('@hazmapper/hooks/user/useAuthenticatedUser', () => ({
  __esModule: true,
  default: () => ({
    data: { username: 'mockUser' },
    isLoading: false,
    error: null,
  }),
}));

test('renders menu', async () => {
  const { getByText } = render(
    <Provider store={store}>
      <MemoryRouter>
        <QueryClientProvider client={testQueryClient}>
          <MainMenu />
        </QueryClientProvider>
      </MemoryRouter>
    </Provider>
  );

  // Wait for the "Main Menu" text to be rendered and then check it
  await waitFor(() => {
    expect(getByText(/Main Menu/)).toBeDefined();
  });
});
