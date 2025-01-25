import React from 'react';
import { waitFor } from '@testing-library/react';
import { renderInTest, testQueryClient } from '@hazmapper/test/testUtil';
import MapControlbar from './MapControlbar';
import {
  projectMock,
  designSafeProjectMock,
} from '@hazmapper/__fixtures__/projectFixtures';
import {
  authenticatedUser,
  unauthenticatedUser,
} from '@hazmapper/__fixtures__/authStateFixtures';

// Mock the useAuthenticatedUser hook
jest.mock('@hazmapper/hooks/user/useAuthenticatedUser', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

import useAuthenticatedUser from '@hazmapper/hooks/user/useAuthenticatedUser';
const useAuthenticatedUserMock = useAuthenticatedUser as jest.Mock;

describe('MapControlbar', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    testQueryClient.clear();
  });

  it('renders non-public MapControlbar with DesignSafe project info when user is authenticated', async () => {
    // Ensure mock returns authenticated user
    useAuthenticatedUserMock.mockImplementation(() => ({
      data: authenticatedUser.user,
      isLoading: false,
      error: null,
    }));

    const { getByText } = renderInTest(
      <MapControlbar activeProject={projectMock} isPublicView={false} />
    );

    await waitFor(() => {
      expect(getByText(`Map: ${projectMock.name}`)).toBeDefined();
      expect(
        getByText(
          `Project: ${designSafeProjectMock.value.projectId} | ${designSafeProjectMock.value.title}`
        )
      ).toBeDefined();
    });
  });

  it('renders public MapControlbar', async () => {
    // Ensure mock returns authenticated user
    useAuthenticatedUserMock.mockImplementation(() => ({
      data: authenticatedUser.user,
      isLoading: false,
      error: null,
    }));
    const { getByText } = renderInTest(
      <MapControlbar activeProject={projectMock} isPublicView={true} />
    );

    await waitFor(() => {
      expect(getByText(`Public Map: ${projectMock.name}`)).toBeDefined();
      expect(
        getByText(
          `Project: ${designSafeProjectMock.value.projectId} | ${designSafeProjectMock.value.title}`
        )
      ).toBeDefined();
    });
  });

  it('renders public MapControlbar when user is not authenticated', async () => {
    // Mock no authenticated user
    useAuthenticatedUserMock.mockImplementation(() => ({
      data: unauthenticatedUser.user,
      isLoading: false,
      error: null,
    }));

    const { getByText, queryByText } = renderInTest(
      <MapControlbar activeProject={projectMock} isPublicView={true} />
    );

    await waitFor(() => {
      expect(getByText(`Public Map: ${projectMock.name}`)).toBeDefined();
      // Verify DesignSafe project info is not present
      expect(
        queryByText(
          `Project: ${designSafeProjectMock.value.projectId} | ${designSafeProjectMock.value.title}`
        )
      ).toBeNull();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
