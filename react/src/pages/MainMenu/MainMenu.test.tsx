import React, { act } from 'react';
import { render, waitFor } from '@testing-library/react';
import MainMenu from './MainMenu';
import { QueryClientProvider } from 'react-query';
import { testQueryClient } from '@hazmapper/testUtil';
import { Provider } from 'react-redux';
import store from '../../redux/store';
import { MemoryRouter } from 'react-router-dom';
import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';
import { systems } from '@hazmapper/__fixtures__/systemsFixture';

import nock from 'nock';

jest.mock('@hazmapper/hooks/user/useAuthenticatedUser', () => ({
  __esModule: true,
  default: () => ({
    data: { username: 'mockUser' },
    isLoading: false,
    error: null,
  }),
}));

test('renders menu', async () => {
  nock(testDevConfiguration.tapisUrl)
    .get('/v3/systems/?listType=ALL')
    .reply(200, systems);
  nock(testDevConfiguration.geoapiUrl).get('/projects/').reply(200, {}); // Fixture being added in https://github.com/TACC-Cloud/hazmapper/pull/273
  nock(testDevConfiguration.designsafePortalUrl)
    .get('/api/projects/v2/')
    .reply(200, { results: [] }); // Fixture being added in https://github.com/TACC-Cloud/hazmapper/pull/273
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
