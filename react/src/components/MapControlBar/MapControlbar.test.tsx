import React from 'react';
import { Provider } from 'react-redux';
import { waitFor, render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { renderInTest, testQueryClient } from '@hazmapper/test/testUtil';
import MapControlbar from './MapControlbar';
import { projectMock, designSafeProjectMock } from '@hazmapper/__fixtures__/projectFixtures';
import { authenticatedUser } from '@hazmapper/__fixtures__/authStateFixtures';
import configureStore from 'redux-mock-store'; // or use your real store
import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';


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

// Mock the Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

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

  /**
   * TO DO:
   * - Figure out how to properly fire off the Taggit button test.
   * - Event most fire from within the MapControlbar context.
   *
   * TEST NOTES:
   * - Test 1 is the original grafted in from MapTabContents for reference.
   * - Test 2 is experiment.
   * - Test 3 and Test 4 throw the same error:
   *    "could not find react-redux context value;
   *    please ensure the component is wrapped in a <Provider>"
   * - Test 5 throws Router in Router error.
   */

  /**
   * No Tests Defined:
   *    Test Suites: 1 failed, 29 passed, 30 total
   *    Tests:       1 failed, 6 skipped, 81 passed, 88 total
   *    FAIL  src/components/FeatureFileTree/FeatureFileTree.test.tsx (13.001 s)
   *
   *
   * Test 1:
   *    Test Suites: 1 failed, 29 passed, 30 total
   *    Tests:       1 failed, 6 skipped, 82 passed, 89 total
   *    FAIL  src/components/MapControlBar/MapControlbar.test.tsx (9.314 s)
   *    # ReferenceError: MapTabContent is not defined
   *
   *
   * Test 2:
   *    Test Suites: 2 failed, 28 passed, 30 total
   *    Tests:       2 failed, 6 skipped, 81 passed, 89 total
   *    FAIL  src/components/FeatureFileTree/FeatureFileTree.test.tsx (8.671 s)
   *    FAIL  src/components/MapControlBar/MapControlbar.test.tsx (9.591 s)
   *    # useNavigate() may be used only in the context of a <Router> component.
   *
   * Test 3:
   *    Test Suites: 2 failed, 28 passed, 30 total
   *    Tests:       1 failed, 6 skipped, 78 passed, 85 total
   *    FAIL  src/components/FeatureFileTree/FeatureFileTree.test.tsx (9.185 s)
   *    FAIL  src/components/MapControlBar/MapControlbar.test.tsx
   *    # Cannot find module 'redux-mock-store' from
   *        'src/components/MapControlBar/MapControlbar.test.tsx'
   *
   * Test 4:
   *    Test Suites: 2 failed, 28 passed, 30 total
   *    Tests:       2 failed, 6 skipped, 81 passed, 89 total
   *    FAIL  src/components/FeatureFileTree/FeatureFileTree.test.tsx (9.289 s)
   *    FAIL  src/components/MapControlBar/MapControlbar.test.tsx
   *    # could not find react-redux context value;
   *        please ensure the component is wrapped in a <Provider>
   *
   * Test 5:
   *    Test Suites: 1 failed, 29 passed, 30 total
   *    Tests:       1 failed, 6 skipped, 82 passed, 89 total
   *    FAIL  src/components/MapControlBar/MapControlbar.test.tsx (9.537 s)
   *    # You cannot render a <Router> inside another <Router>.
   *      You should never have more than one in your app.
   */

  //////////////////////////////////////////////////////////////////////////
  // TEST v1. (Original Test).

  // it('navigates to Taggit when "View in Taggit" button is clicked', async () => {
  //   const windowOpenSpy = jest
  //     .spyOn(window, 'open')
  //     .mockImplementation(() => null);
  //   renderInTest(
  //     <MapTabContent
  //       project={projectMock}
  //       onProjectUpdate={mockOnProjectUpdate}
  //       isPending={false}
  //     />
  //   );

  //   const taggitButton = screen.getByTestId('taggit-button');
  //   fireEvent.click(taggitButton);

  //   await waitFor(() => {
  //     // Taggit will read from local storage
  //     expect(localStorage.getItem('testLastProject')).toBe(
  //       JSON.stringify(projectMock)
  //     );
  //   });
  //   await waitFor(() => expect(windowOpenSpy).toHaveBeenCalledTimes(1));
  //   expect(windowOpenSpy).toHaveBeenCalledWith(
  //     testDevConfiguration.taggitUrl,
  //     '_blank',
  //     'noreferrer noopener'
  //   );
  //   windowOpenSpy.mockRestore();
  // });

  //////////////////////////////////////////////////////////////////////////
  // TEST v2.

  // it('navigates to Taggit when "View in Taggit" button is clicked', () => {
  //   const mockNavigate = jest.fn();
  //   (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

  //   render(<MapControlbar activeProject={projectMock} isPublicView={true} />);

  //   const taggitButton = screen.getByTestId('taggit-button');
  //   fireEvent.click(taggitButton);

  //   expect(mockNavigate).toHaveBeenCalledWith(
  //     testDevConfiguration.taggitUrl,
  //     '_blank',
  //     'noreferrer noopener'
  //   );
  // });

    //////////////////////////////////////////////////////////////////////////
  // TEST v3.

  // test('navigates to Taggit when "View in Taggit" button is clicked', () => {
  //   // Mock the Provider
  //   const mockStore = configureStore([]);
  //   // const store = mockStore({
  //   //   // user: { name: 'Alice' },
  //   // });
  //   const store = mockStore(testDevConfiguration);

  //   const mockNavigate = jest.fn();
  //   (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

  //   render(
  //     <Provider store={store}>
  //       <MemoryRouter>
  //         <MapControlbar />
  //       </MemoryRouter>
  //     </Provider>
  //   );

  //   fireEvent.click(screen.getByRole('button', { name: /view in taggit/i }));
  //   expect(mockNavigate).toHaveBeenCalledWith('/taggit'); // replace with actual path
  // });

  //////////////////////////////////////////////////////////////////////////
  // TEST v4.

  // it('navigates to Taggit when "View in Taggit" button is clicked', () => {
  //   // Before this one test.
  //   const originalOpen = window.open;
  //   const originalLocalStorage = global.localStorage;

  //   // Mock window.open
  //   window.open = jest.fn();

  //   // Mock localStorage
  //   const localStorageMock = (() => {
  //     let store: Record<string, string> = {};
  //     return {
  //       getItem: jest.fn((key) => store[key]),
  //       setItem: jest.fn((key, value) => {
  //         store[key] = value;
  //       }),
  //       clear: jest.fn(() => {
  //         store = {};
  //       }),
  //     };
  //   })();
  //   Object.defineProperty(window, 'localStorage', {
  //     value: localStorageMock,
  //   });

  //   const fakeProject = { id: 'abc123', name: 'Test Project' };
  //   const config = testDevConfiguration;

  //   const mockNavigate = jest.fn();
  //   (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

  //   render(
  //     <MemoryRouter>
  //       <MapControlbar
  //         activeProject={fakeProject}
  //         designSafeProject={null}
  //         isPublicView={false}
  //         isFeaturesLoading={false}
  //         isFeaturesError={false}
  //         canSwitchToPrivateMap={false}
  //         project={fakeProject}
  //         onProjectUpdate={jest.fn()}
  //       />
  //     </MemoryRouter>
  //   );

  //   const button = screen.getByTestId('taggit-button');
  //   fireEvent.click(button);

  //   const expectedKey = `${config.geoapiEnv}LastProject`;
  //   expect(localStorage.setItem).toHaveBeenCalledWith(
  //     expectedKey,
  //     JSON.stringify(fakeProject)
  //   );

  //   expect(window.open).toHaveBeenCalledWith(
  //     config.taggitUrl,
  //     '_blank',
  //     'noreferrer noopener'
  //   );

  //   // After this one test.
  //   window.open = originalOpen;
  //   global.localStorage = originalLocalStorage;
  // });

  //////////////////////////////////////////////////////////////////////////
  // TEST v5. (Original Test Extended).

  it('navigates to Taggit when "View in Taggit" button is clicked', async () => {
    const testProject = projectMock;
    const testDSProject = designSafeProjectMock;

    const windowOpenSpy = jest
      .spyOn(window, 'open')
      .mockImplementation(() => null);
    renderInTest(
      // <MemoryRouter>
      <MapControlbar
        activeProject={testProject}
        designSafeProject={testDSProject}
        isPublicView={false}
        isFeaturesLoading={false}
        isFeaturesError={false}
        canSwitchToPrivateMap={false}
        project={testProject}
        onProjectUpdate={jest.fn()}
      />
      // </MemoryRouter>
    );

    const taggitButton = screen.getByTestId('taggit-button');
    fireEvent.click(taggitButton);

    await waitFor(() => {
      // Taggit will read from local storage
      expect(localStorage.getItem('testLastProject')).toBe(
        JSON.stringify(projectMock)
      );
    });
    await waitFor(() => expect(windowOpenSpy).toHaveBeenCalledTimes(1));
    expect(windowOpenSpy).toHaveBeenCalledWith(
      testDevConfiguration.taggitUrl,
      '_blank',
      'noreferrer noopener'
    );
    windowOpenSpy.mockRestore();
  });

  //////////////////////////////////////////////////////////////////////////

  afterEach(() => {
    jest.clearAllMocks();
  });
});
