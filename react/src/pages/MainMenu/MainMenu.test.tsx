import React from 'react';
import { waitFor } from '@testing-library/react';
import MainMenu from './MainMenu';
import { renderInTest } from '@hazmapper/test/testUtil';

jest.mock('@hazmapper/hooks/user/useAuthenticatedUser', () => ({
  __esModule: true,
  default: () => ({
    username: 'mockUser',
    hasValidTapisToken: true,
  }),
}));

test('renders menu', async () => {
  const { getByText } = renderInTest(<MainMenu />);

  // Wait for the "Main Menu" text to be rendered and then check it
  await waitFor(() => {
    expect(getByText(/mockUser/)).toBeDefined();
  });
});
