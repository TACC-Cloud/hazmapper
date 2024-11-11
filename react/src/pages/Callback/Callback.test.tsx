import React from 'react';
import { renderInTest } from '@hazmapper/test/testUtil';
import Callback from './Callback';

test('renders callback', async () => {
  const { getByText } = renderInTest(<Callback />, '/callback');

  expect(getByText(/Logging in/)).toBeDefined();
});
