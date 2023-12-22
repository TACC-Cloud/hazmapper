import React from 'react';
import { render } from '@testing-library/react';
import MainMenu from './MainMenu';
import { QueryClientProvider } from 'react-query';
import { testQueryClient } from '../../testUtil';
import { Provider } from 'react-redux';
import store from '../../redux/store';

test('renders menu', () => {
  const { getByText } = render(
    <Provider store={store}>
      <QueryClientProvider client={testQueryClient}>
        <MainMenu />
      </QueryClientProvider>
    </Provider>
  );
  expect(getByText(/Main Menu/)).toBeDefined();
});
