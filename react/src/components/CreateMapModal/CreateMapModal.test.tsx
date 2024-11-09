import React, { act } from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from '../../redux/store';
import { http, HttpResponse } from 'msw';

import CreateMapModal from './CreateMapModal';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from 'react-query';
import { testQueryClient, server } from '@hazmapper/testUtil';
import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';

jest.mock('@hazmapper/hooks/user/useAuthenticatedUser', () => ({
  __esModule: true,
  default: () => ({
    data: { username: 'mockUser' },
    isLoading: false,
    error: null,
  }),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const toggleMock = jest.fn();

const renderComponent = async (isOpen = true) => {
  await act(async () => {
    render(
      <Provider store={store}>
        <QueryClientProvider client={testQueryClient}>
          <Router>
            <CreateMapModal isOpen={isOpen} toggle={toggleMock} />
          </Router>
        </QueryClientProvider>
      </Provider>
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

  test('submits form data successfully', async () => {
    server.use(
      http.post(`${testDevConfiguration.geoapiUrl}/projects/`, () => {
        return HttpResponse.json({ uuid: 123 }, { status: 200 });
      })
    ); // Fixture being added in https://github.com/TACC-Cloud/hazmapper/pull/273

    await renderComponent();
    await act(async () => {
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
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/project/123');
    });
  });

  test('displays error message on submission error', async () => {
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
      fireEvent.change(screen.getByLabelText(/Description/), {
        target: { value: 'A map with an error' },
      });
      fireEvent.change(screen.getByLabelText(/Custom File Name/), {
        target: { value: 'error-file' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Create/ }));
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          'An error occurred while creating the project. Please contact support.'
        )
      ).toBeTruthy();
    });
  });
});
