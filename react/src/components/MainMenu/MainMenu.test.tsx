import React from 'react';
import { render } from '@testing-library/react';
import MainMenu from './MainMenu';

test('renders menu', () => {
  const { getByText } = render(<MainMenu />);
  expect(getByText(/Main Menu/)).toBeDefined();
});
