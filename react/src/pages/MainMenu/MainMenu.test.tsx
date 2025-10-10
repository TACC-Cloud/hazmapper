import React from 'react';
import { waitFor } from '@testing-library/react';
import MainMenu from './MainMenu';
import { renderInTest } from '@hazmapper/test/testUtil';
import { authenticatedUser } from '@hazmapper/__fixtures__/authStateFixtures';

test('renders menu', async () => {
  const { getByText } = renderInTest(<MainMenu />);

  // Wait for the "Main Menu" text to be rendered and then check it
  await waitFor(() => {
    expect(getByText(authenticatedUser.username)).toBeDefined();
  });
});
