import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import CreateMapModal from './CreateMapModal';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

jest.mock('../../hooks/user/useAuthenticatedUser', () => ({
  __esModule: true,
  default: () => ({
    data: { username: 'mockUser', email: 'mockUser@example.com' },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../hooks/projects/useCreateProject', () => ({
  __esModule: true,
  default: () => ({
    mutate: jest.fn((data, { onSuccess, onError }) => {
      if (data.name === 'Error Map') {
        // Simulate a submission error with a 500 status code
        onError({ response: { status: 500 } });
      } else {
        // Simulate successful project creation
        onSuccess({ uuid: '123' });
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

const renderComponent = (isOpen = true) => {
  render(
    <QueryClientProvider client={queryClient}>
      <Router>
        <CreateMapModal isOpen={isOpen} toggle={toggleMock} />
      </Router>
    </QueryClientProvider>
  );
};

describe('CreateMapModal', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders the modal when open', () => {
    renderComponent();
    expect(screen.getByText(/Create a New Map/)).toBeTruthy();
  });

  test('submits form data successfully', async () => {
    renderComponent();
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Success Map' },
    });
    fireEvent.change(screen.getByLabelText(/Description/), {
      target: { value: 'A successful map' },
    });
    fireEvent.change(screen.getByLabelText(/Custom File Name/), {
      target: { value: 'success-file' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Create/ }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/project/123');
    });
  });

  test('displays error message on submission error', async () => {
    renderComponent();
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Error Map' },
    });
    fireEvent.change(screen.getByLabelText(/Description/), {
      target: { value: 'A map with an error' },
    });
    fireEvent.change(screen.getByLabelText(/Custom File Name/), {
      target: { value: 'error-file' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Create/ }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'An error occurred while creating the project. Please contact support.'
        )
      ).toBeTruthy();
    });
  });
});
