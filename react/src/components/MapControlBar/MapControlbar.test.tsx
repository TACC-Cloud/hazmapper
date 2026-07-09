import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { renderInTest } from '@hazmapper/test/testUtil';
import MapControlbar from './MapControlbar';
import {
  projectMock,
  designSafeProjectMock,
  designSafePublishedProjectDetailMock,
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
      expect(getByText(/Map:/)).toBeDefined();
      expect(getByText(new RegExp(projectMock.name))).toBeDefined();
    });

    await waitFor(() => {
      expect(
        getByText(new RegExp(designSafeProjectMock.value.title))
      ).toBeDefined();
    });
  });

  it('renders public MapControlbar (authenticated)', async () => {
    const { getByText } = renderInTest(
      <MapControlbar activeProject={projectMock} isPublicView={true} />
    );

    await waitFor(() => {
      expect(getByText(/Public Map:/)).toBeDefined();
      expect(getByText(new RegExp(projectMock.name))).toBeDefined();
    });

    await waitFor(() => {
      expect(getByText(/Project:/)).toBeDefined();
      expect(
        getByText(new RegExp(designSafeProjectMock.value.projectId))
      ).toBeDefined();
      expect(
        getByText(new RegExp(designSafeProjectMock.value.title))
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
      expect(getByText(/Public Map:/)).toBeDefined();
      expect(getByText(new RegExp(projectMock.name))).toBeDefined();
    });

    // For unauthenticated users, project info comes from published project endpoint
    await waitFor(() => {
      expect(getByText(/Project:/)).toBeDefined();
      expect(
        getByText(
          new RegExp(designSafePublishedProjectDetailMock.baseProject.projectId)
        )
      ).toBeDefined();
      expect(
        getByText(
          new RegExp(designSafePublishedProjectDetailMock.baseProject.title)
        )
      ).toBeDefined();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
