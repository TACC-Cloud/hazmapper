import React from 'react';
import { renderInTest } from '@hazmapper/test/testUtil';
import Callback from './Callback';

test('renders callback', async () => {
  const { getByTestId } = renderInTest(<Callback />, '/callback');

  expect(getByTestId('spin')).toBeTruthy();
});
