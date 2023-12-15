import React from 'react';
import { render } from '@testing-library/react';
import StreetviewCallback from './StreetviewCallback';

test('renders streetview callback', () => {
  const { getByText } = render(<StreetviewCallback />);
  expect(getByText(/StreetviewCallback/)).toBeDefined();
});
