import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import MapModal from './MapModal';

describe('MapModal', () => {
  const dummyOnSubmit = jest.fn();

  beforeEach(() => {
    render(
      <MapModal
        isOpen={true}
        toggle={() => {
          // noop
        }}
        onSubmit={dummyOnSubmit}
        isCreating={false}
      />
    );
  });

  test('renders the modal when open', () => {
    expect(screen.getByText(/Create a New Map/)).toBeTruthy();
  });

  test('allows form field interaction and submission', async () => {
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
        system_path: '/tgrafft',
      },
    };

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Create/ }));
    await waitFor(() => {
      expect(dummyOnSubmit).toHaveBeenCalledWith(expectedData);
    });
  });
});
