import React, { act } from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import CreateMapModal from './CreateMapModal';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { testQueryClient, server } from '@hazmapper/test/testUtil';
import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';
import { projectMock } from '@hazmapper/__fixtures__/projectFixtures';
import { filesMock } from '@hazmapper/__fixtures__/fileFixture';

jest.mock('@hazmapper/hooks/files/useFiles', () => ({
  __esModule: true,
  useFiles: jest.fn(() => ({
    data: filesMock,
    refetch: jest.fn(),
  })),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@aperturerobotics/chonky', () => {
  return {
    FileBrowser: jest.fn(({ children, onFileAction }) => (
      <div
        onClick={onFileAction}
        onKeyDown={onFileAction}
        role="button"
        tabIndex={0}
      >
        {children}
      </div>
    )),
    FileNavbar: jest.fn(() => <div>Mock FileNavbar</div>),
    FileList: jest.fn(() => <div>Mock FileList</div>),
    FileData: jest.fn(),
    ChonkyActions: {
      EnableListView: { id: 'enable-list-view' },
      OpenFiles: { id: 'open-files' },
      MouseClickFile: { id: 'mouse-click-file' },
      ChangeSelection: { id: 'change-selection' },
    },
  };
});

const toggleMock = jest.fn();

const renderComponent = async (isOpen = true) => {
  await act(async () => {
    render(
      <QueryClientProvider client={testQueryClient}>
        <Router>
          <CreateMapModal isOpen={isOpen} closeModal={toggleMock} />
        </Router>
      </QueryClientProvider>
    );
  });
};

describe('CreateMapModal', () => {
  test('renders the modal when open', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Create a New Map/)).toBeTruthy();
    });
  });

  test.skip('submits form data successfully', async () => {
    server.use(
      http.post(`${testDevConfiguration.geoapiUrl}/projects/`, () => {
        return HttpResponse.json(projectMock, { status: 200 });
      })
    );

    await renderComponent();
    await act(async () => {
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'Success Map' },
      });
      fireEvent.change(screen.getByTestId('description'), {
        target: { value: 'A successful map' },
      });
      fireEvent.change(screen.getByTestId('custom-file-name'), {
        target: { value: 'success-file' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Create Map/ }));
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/project/${projectMock.uuid}`);
    });
  });

  test.skip('displays error message on submission error', async () => {
    server.use(
      http.post(`${testDevConfiguration.geoapiUrl}/projects/`, async () => {
        return new HttpResponse(null, {
          status: 500,
        });
      })
    );

    await renderComponent();
    await act(async () => {
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'Error Map' },
      });
      fireEvent.change(screen.getByTestId('description'), {
        target: { value: 'A map with an error' },
      });
      fireEvent.change(screen.getByTestId('custom-file-name'), {
        target: { value: 'error-file' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Create Map/ }));
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          'An error occurred while creating the project. Please contact support.'
        )
      ).toBeTruthy();
    });
  });

  test('displays error message for invalid file name', async () => {
    await renderComponent();
    await act(async () => {
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'Invalid Map' },
      });
      fireEvent.change(screen.getByTestId('description'), {
        target: { value: 'A map with invalid file name' },
      });
      fireEvent.change(screen.getByTestId('custom-file-name'), {
        target: { value: 'invalid file name' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Create Map/ }));
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          'Only letters, numbers, hyphens, underscores, and periods are allowed'
        )
      ).toBeTruthy();
    });
  });
});
