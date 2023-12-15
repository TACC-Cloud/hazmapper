import React from 'react';
import { render } from '@testing-library/react';
import MainMenu from './MainMenu';
import { Provider } from 'react-redux';
import store from '../../redux/store';

test('renders menu', () => {
  const { getByText } = render(
    <Provider store={store}>
      <MainMenu />
    </Provider>
  );
  expect(getByText(/Main Menu/)).toBeDefined();
});
