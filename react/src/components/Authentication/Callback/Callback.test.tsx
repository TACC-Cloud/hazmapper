import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import store from '../../../redux/store';
import Callback from './Callback';

test('renders callback', async () => {
  const { getByText } = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/callback']}>
        <Callback />
      </MemoryRouter>
    </Provider>
  );
  expect(getByText(/Logging in/)).toBeDefined();

  // TODO check local storage etc
});
