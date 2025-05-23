import React from 'react';
import { waitFor } from '@testing-library/react';
import { renderInTest, testQueryClient } from '@hazmapper/test/testUtil';
import MapControlbar from './MapControlbar';
import {
  projectMock,
  designSafeProjectMock,
} from '@hazmapper/__fixtures__/projectFixtures';
import { authenticatedUser } from '@hazmapper/__fixtures__/authStateFixtures';

// Mock the useAuthenticatedUser hook BEFORE importing it
jest.mock('@hazmapper/hooks', () => {
  const originalModule = jest.requireActual('@hazmapper/hooks');
  return {
    ...originalModule, // Keep all other hooks unchanged
    useAuthenticatedUser: jest.fn(), // Mock only this hook
  };
});

// Import AFTER mocking
import { useAuthenticatedUser } from '@hazmapper/hooks';
const mockedUseAuthenticatedUser = useAuthenticatedUser as jest.MockedFunction<
  typeof useAuthenticatedUser
>;

describe('MapControlbar', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    testQueryClient.clear();

    // mock for all tests (except that alter this) that we
    // have a logged im uiser
    mockedUseAuthenticatedUser.mockImplementation(() => ({
      data: { username: authenticatedUser.user?.username || '' },
      username: authenticatedUser.user?.username || '',
      hasValidTapisToken: true,
    }));
  });

  it('renders non-public MapControlbar with DesignSafe project info when user is authenticated', async () => {
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

  it('renders public MapControlbar (authenticated)', async () => {
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

  it('renders public MapControlbar (unauthenticated)', async () => {
    // Mock no authenticated user
    mockedUseAuthenticatedUser.mockImplementation(() => ({
      data: { username: '' },
      username: '',
      hasValidTapisToken: false,
    }));

    const { getByText } = renderInTest(
      <MapControlbar activeProject={projectMock} isPublicView={true} />
    );

    await waitFor(() => {
      expect(getByText(`Public Map: ${projectMock.name}`)).toBeDefined();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
