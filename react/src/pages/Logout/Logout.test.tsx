import React from 'react';
import { render } from '@testing-library/react';
import Logout from './Logout';
import { BrowserRouter } from 'react-router-dom';

test('renders logout', async () => {
  const { getByText } = render(
    <BrowserRouter>
      <Logout />
    </BrowserRouter>
  );
  expect(getByText(/Log in/)).toBeDefined();
});
