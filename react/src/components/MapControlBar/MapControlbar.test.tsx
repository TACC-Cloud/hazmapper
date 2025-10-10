import { waitFor, screen, fireEvent, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { renderInTest } from '@hazmapper/test/testUtil';
import MapControlbar from './MapControlbar';
import {
  projectMock,
  designSafeProjectMock,
} from '@hazmapper/__fixtures__/projectFixtures';
import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';
import { server } from '@hazmapper/test/testUtil';
import { unauthenticatedUser } from '@hazmapper/__fixtures__/authStateFixtures';

// Mock the Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('MapControlbar', () => {
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
    server.use(
      http.get(`${testDevConfiguration.geoapiUrl}/auth/user/`, () =>
        HttpResponse.json(unauthenticatedUser, { status: 200 })
      )
    );
    const { getByText } = renderInTest(
      <MapControlbar activeProject={projectMock} isPublicView={true} />
    );

    await waitFor(() => {
      expect(getByText(`Public Map: ${projectMock.name}`)).toBeDefined();
    });
  });

  it('navigates to Taggit when "View in Taggit" button is clicked', async () => {
    const testProject = projectMock;

    const windowOpenSpy = jest
      .spyOn(window, 'open')
      .mockImplementation(() => null);

    await act(async () => {
      renderInTest(
        <MapControlbar activeProject={testProject} isPublicView={false} />
      );
    });

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

  afterEach(() => {
    jest.clearAllMocks();
  });
});
