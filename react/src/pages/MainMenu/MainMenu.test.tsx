import React from 'react';
import { render } from '@testing-library/react';
import MainMenu from './MainMenu';
import { QueryClientProvider } from 'react-query';
import { testQueryClient } from '../../testUtil';
import { Provider } from 'react-redux';
import store from '../../redux/store';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('socket.io-client', () => {
  return {
    __esModule: true,
    default: () => {
      return {
        on: jest.fn(),
        emit: jest.fn(),
        off: jest.fn(),
      };
    },
  };
});

jest.mock('react-toastify', () => ({
  toast: {
    info: jest.fn(),
  },
}));

test('renders menu', () => {
  const { getByText } = render(
    <Provider store={store}>
      <Router>
        <QueryClientProvider client={testQueryClient}>
          <MainMenu />
        </QueryClientProvider>
      </Router>
    </Provider>
  );
  expect(getByText(/Main Menu/)).toBeDefined();
});
