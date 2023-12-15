import React from 'react';
import { render } from '@testing-library/react';
import Logout from './Logout';
import { Provider } from 'react-redux';
import store from '../../redux/store';
import { BrowserRouter } from 'react-router-dom';

test('renders logout', async () => {
  const { getByText } = render(
    <Provider store={store}>
      <BrowserRouter>
        <Logout />
      </BrowserRouter>
    </Provider>
  );
  expect(getByText(/Log in/)).toBeDefined();
});
