import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DeleteMapModal from './DeleteMapModal';
import { projectMock } from '../../__fixtures__/projectFixtures';
import { Project } from '../../types';
import { useDeleteProject } from '../../hooks/projects';

jest.mock('../../hooks/projects', () => ({
  useDeleteProject: jest.fn(),
}));

const mockHookReturn = {
  mutate: jest.fn(),
  isLoading: false,
  isError: false,
  isSuccess: false,
};

const nonDeletableProjectMock: Project = {
  ...projectMock,
  deletable: false,
  name: 'Non-Deletable Project',
};

const publicProjectMock: Project = {
  ...projectMock,
  public: true,
  name: 'Public Project',
};

const toggleMock = jest.fn();
const queryClient = new QueryClient();

const renderComponent = async (projectData: Project = projectMock) => {
  await act(async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <DeleteMapModal
            isOpen={true}
            close={toggleMock}
            project={projectData}
          />
        </Router>
      </QueryClientProvider>
    );
  });
};

describe('DeleteMapModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useDeleteProject as jest.Mock).mockReturnValue(mockHookReturn);
  });

  describe('DeleteMapModal', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (useDeleteProject as jest.Mock).mockReturnValue(mockHookReturn);
    });

    it('should display the modal with correct project name', async () => {
      await renderComponent();
      const titleElement = screen.getByText(`Delete Map: ${projectMock.name}`);
      expect(titleElement).toBeDefined();
    });

    it('should show delete confirmation message for deletable projects', async () => {
      await renderComponent();
      const confirmMessage = screen.getByText(
        /Are you sure you want to delete this map?/
      );
      const warningMessage = screen.getByText(/This cannot be undone./);
      expect(confirmMessage).toBeDefined();
      expect(warningMessage).toBeDefined();
    });

    it('should show permission denied message for non-deletable projects', async () => {
      await renderComponent(nonDeletableProjectMock);
      const deniedMessage = screen.getByText('permission to delete this map', {
        exact: false,
      });
      expect(deniedMessage).toBeDefined();
    });

    it('should disable delete button for non-deletable projects', async () => {
      await renderComponent(nonDeletableProjectMock);
      const deleteButton = screen.getByTestId(
        'delete-map-button'
      ) as HTMLButtonElement;
      expect(deleteButton.disabled).toBe(true);
    });

    it('should enable delete button for deletable projects', async () => {
      await renderComponent();
      const deleteButton = screen.getByTestId(
        'delete-map-button'
      ) as HTMLButtonElement;
      expect(deleteButton.disabled).toBe(false);
    });

    it('should show additional warning for public projects', async () => {
      await renderComponent(publicProjectMock);
      const publicWarning = screen.getByText(/Note that this is a public map./);
      expect(publicWarning).toBeDefined();
    });

    it('should show error message when isError is true', async () => {
      (useDeleteProject as jest.Mock).mockReturnValue({
        ...mockHookReturn,
        isError: true,
      });
      await renderComponent();
      const errorMessage = screen.getByText(
        'There was an error deleting your map.'
      );
      expect(errorMessage).toBeDefined();
    });
  });
});
