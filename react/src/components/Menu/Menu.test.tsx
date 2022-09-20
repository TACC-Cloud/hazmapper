import React from 'react';
import { render } from '@testing-library/react';
import Menu from './Menu';

test('renders menu', () => {
  const { getByText } = render(<Menu />);
  expect(getByText(/Menu/)).toBeDefined();
});
