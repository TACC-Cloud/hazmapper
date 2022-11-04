import React from 'react';
import { render } from '@testing-library/react';
import Map from './Map';

test('renders map', () => {
  const { getByText } = render(<Map />);
  expect(getByText(/Map/)).toBeDefined();
});
