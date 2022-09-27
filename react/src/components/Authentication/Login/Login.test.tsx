import React from 'react';
import { render } from '@testing-library/react';
import Login from './Login';

test('renders login', () => {
  const { getByText } = render(<Login />);
  expect(getByText(/Login/)).toBeDefined();
});
