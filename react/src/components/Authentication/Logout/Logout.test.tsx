import React from 'react';
import { render } from '@testing-library/react';
import Logout from './Logout';

test('renders logout', () => {
  const { getByText } = render(<Logout />);
  expect(getByText(/Logout/)).toBeDefined();
});
