import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import DeleteMapModal from './DeleteMapModal';
import { Provider } from 'react-redux';
import store from '../../redux/store';
import { projectMock } from '../../__fixtures__/projectFixtures';

jest.mock('../../hooks/projects/useProjects', () => ({
  __esModule: true,
  useDeleteProject: (projectId) => ({
    mutate: jest.fn((data, { onSuccess, onError }) => {
      if (projectId === 404) {
        onError({ response: { status: 404 } });
      } else {
        onSuccess();
      }
    }),
    isLoading: false,
  }),
}));
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const toggleMock = jest.fn();
const queryClient = new QueryClient();

const renderComponent = async (
  projectId = 123,
  projectName = 'Sample Project'
) => {
  await act(async () => {
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <DeleteMapModal
              isOpen={true}
              toggle={toggleMock}
              projectId={projectMock.id}
              project={projectMock}
            />
          </Router>
        </QueryClientProvider>
      </Provider>
    );
  });
};

describe('DeleteMapModal', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders the modal when open', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Delete Map: Sample Project')).toBeTruthy();
    });
  });

  test('successfully deletes a project', async () => {
    await renderComponent(123, 'Sample Project');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Delete/ }));
    });

    await waitFor(() => {
      expect(toggleMock).toHaveBeenCalled();
    });
  });
});
