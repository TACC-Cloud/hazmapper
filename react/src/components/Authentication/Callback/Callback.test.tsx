import React from 'react';
import { render } from '@testing-library/react';
import Callback from './Callback';

test('renders callback', () => {
  const { getByText } = render(<Callback />);
  expect(getByText(/Callback/)).toBeDefined();
});
