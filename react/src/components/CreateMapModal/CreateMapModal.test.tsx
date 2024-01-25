import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import CreateMapModal from './CreateMapModal';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../redux/authSlice';
import { geoapi } from '../../redux/api/geoapi';
import { BrowserRouter as Router } from 'react-router-dom';

describe('CreateMapModal', () => {
  const dummyOnSubmit = jest.fn();

  const mockUsername = 'mockUser';
  const mockEmail = 'mockUser@example.com';

  const mockToken = {
    token: 'mockTokenValue',
    expires: Date.now() + 1000 * 60 * 60,
  };

  const mockStore = configureStore({
    reducer: {
      auth: authReducer,
      [geoapi.reducerPath]: geoapi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(geoapi.middleware),
    preloadedState: {
      auth: {
        user: { username: mockUsername, email: mockEmail },
        token: mockToken,
      },
    },
  });
  const renderComponent = () => {
    return render(
      <Provider store={mockStore}>
        <Router>
          <CreateMapModal
            isOpen={true}
            toggle={() => {
              //no op
            }}
            onSubmit={dummyOnSubmit}
            isCreating={false}
          />
        </Router>
      </Provider>
    );
  };

  afterEach(() => {
    cleanup();
  });

  test('renders the modal when open', () => {
    renderComponent();
    expect(screen.getByText(/Create a New Map/)).toBeTruthy();
  });

  test('allows form field interaction and submission', async () => {
    renderComponent();
    // Interact with name field
    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Test Map' } });
    expect(nameInput.value).toBe('Test Map');

    // Interact with description field
    const descriptionInput = screen.getByLabelText(
      /Description/
    ) as HTMLInputElement;
    fireEvent.change(descriptionInput, {
      target: { value: 'Test Description' },
    });
    expect(descriptionInput.value).toBe('Test Description');

    // Interact with custom file name field
    const customFileNameInput = screen.getByLabelText(
      /Custom File Name/
    ) as HTMLInputElement;
    fireEvent.change(customFileNameInput, { target: { value: 'test-file' } });
    expect(customFileNameInput.value).toBe('test-file');

    // Prepare expected data based on the form structure
    const expectedData = {
      observable: false,
      watch_content: false,
      project: {
        name: 'Test Map',
        description: 'Test Description',
        system_file: 'test-file',
        system_id: 'designsafe.storage.default',
        system_path: `/${mockUsername}`,
      },
    };

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Create/ }));
    await waitFor(() => {
      expect(dummyOnSubmit).toHaveBeenCalledWith(
        expectedData,
        expect.anything(),
        expect.anything()
      );
    });
  });
  test('specific 409 error message is displayed', async () => {
    const mockOnSubmitWith409Error = jest
      .fn()
      .mockImplementation((projectData, actions, setError) => {
        const error = { response: { status: 409 } };
        console.error('Error creating project:', error);
        setError('That folder is already syncing with a different map.');
        actions.setSubmitting(false);
      });

    render(
      <Provider store={mockStore}>
        <Router>
          <CreateMapModal
            isOpen={true}
            toggle={() => {
              //no op
            }}
            onSubmit={mockOnSubmitWith409Error}
            isCreating={false}
          />
        </Router>
      </Provider>
    );

    // Interact with the form fields
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Test Map' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(screen.getByLabelText('Custom File Name'), {
      target: { value: 'test-file' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Create/ }));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByText('That folder is already syncing with a different map.')
      ).toBeTruthy();
    });
  });

  test('specific 500 error message is displayed', async () => {
    const mockOnSubmitWith500Error = jest
      .fn()
      .mockImplementation((projectData, actions, setError) => {
        const error = { response: { status: 500 } };
        console.error('Error creating project:', error);
        setError('Internal server error. Please contact support.');
        actions.setSubmitting(false);
      });

    render(
      <Provider store={mockStore}>
        <Router>
          <CreateMapModal
            isOpen={true}
            toggle={() => {
              //no op
            }}
            onSubmit={mockOnSubmitWith500Error}
            isCreating={false}
          />
        </Router>
      </Provider>
    );

    // Interact with the form fields
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Test Map' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(screen.getByLabelText('Custom File Name'), {
      target: { value: 'test-file' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Create/ }));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByText('Internal server error. Please contact support.')
      ).toBeTruthy();
    });
  });

  test('generic error message is displayed on other submission errors', async () => {
    const mockOnSubmitWithGenericError = jest
      .fn()
      .mockImplementation((projectData, actions, setError) => {
        setError('Something went wrong. Please contact support.');
        actions.setSubmitting(false);
      });

    render(
      <Provider store={mockStore}>
        <Router>
          <CreateMapModal
            isOpen={true}
            toggle={() => {
              //no op
            }}
            onSubmit={mockOnSubmitWithGenericError}
            isCreating={false}
          />
        </Router>
      </Provider>
    );

    // Interact with the form fields
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Test Map' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(screen.getByLabelText('Custom File Name'), {
      target: { value: 'test-file' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Create/ }));

    await waitFor(() => {
      expect(
        screen.getByText('Something went wrong. Please contact support.')
      ).toBeTruthy();
    });
  });
});
