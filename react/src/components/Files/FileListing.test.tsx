import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { FileListing } from './FileListing';
import {
  useFiles,
  useAuthenticatedUser,
  useDesignSafeProjects,
  useGetSystems,
} from '../../hooks';
import { serializeToChonkyFile } from '../../utils/fileUtils';
import { FileBrowser } from 'chonky';

// Mock dependencies
jest.mock('../../hooks', () => ({
  useFiles: jest.fn(() => ({
    data: [],
    refetch: jest.fn(),
  })),
  useDesignSafeProjects: jest.fn(() => ({ result: [] })),
  useAuthenticatedUser: jest.fn(() => ({ data: { username: 'test-user' } })),
  useGetSystems: jest.fn(() => ({ data: { systems: [] } })),
}));

jest.mock('../../utils/fileUtils', () => ({
  serializeToChonkyFile: jest.fn(),
}));

// TODO see if we don't have to mock chonky
jest.mock('chonky', () => {
  const actualChonky = jest.requireActual('chonky');
  return {
    ...actualChonky,
    FileBrowser: jest.fn((props) => <div {...props}>Mock FileBrowser</div>),
    FileNavbar: jest.fn(() => <div>Mock FileNavbar</div>),
    FileList: jest.fn(() => <div>Mock FileList</div>),
    ChonkyActions: actualChonky.ChonkyActions,
  };
});

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useFormContext: jest.fn(() => ({
    register: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn(() => ({})),
    watch: jest.fn(),
    formState: { errors: {} },
    reset: jest.fn(),
  })),
  useForm: jest.fn(() => ({
    register: jest.fn(),
    handleSubmit: jest.fn(),
    watch: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn(),
    formState: {
      errors: {},
    },
    reset: jest.fn(),
  })),
}));

describe('FileListing', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    (useForm as jest.Mock).mockReturnValue({
      register: jest.fn(),
      handleSubmit: jest.fn(),
      watch: jest.fn(),
      setValue: jest.fn(),
      getValues: jest.fn(),
      formState: {
        errors: {},
      },
      reset: jest.fn(),
    });
    (useFormContext as jest.Mock).mockReturnValue({
      register: jest.fn(),
      setValue: jest.fn(),
      getValues: jest.fn(() => ({})),
      watch: jest.fn(),
      formState: { errors: {} },
      reset: jest.fn(),
    });
  });

  it('renders without crashing and displays "No systems available" if no systems are returned', () => {
    (useGetSystems as jest.Mock).mockReturnValue({
      data: { systems: [], myDataSystem: null },
      isFetched: true,
      isLoading: false,
    });
    (useDesignSafeProjects as jest.Mock).mockReturnValue({
      result: [],
    });
    (useAuthenticatedUser as jest.Mock).mockReturnValue({
      data: { username: 'test-user' },
    });
    (useFiles as jest.Mock).mockReturnValue({ data: [] });
    render(<FileListing disableSelection={false} />);

    const element = screen.getByText(/No systems available/i);
    expect(document.body.contains(element)).toBe(true);
  });

  it('renders the file browser when systems are available', () => {
    (useGetSystems as jest.Mock).mockReturnValue({
      data: {
        systems: [{ id: 'designsafe.storage.default' }],
        myDataSystem: { id: 'designsafe.storage.default' },
      },
      isFetched: true,
      isLoading: false,
    });

    (useFiles as jest.Mock).mockReturnValue({
      data: [],
      refetch: jest.fn(),
    });
    (useDesignSafeProjects as jest.Mock).mockReturnValue({
      data: [],
    });
    (useAuthenticatedUser as jest.Mock).mockReturnValue({
      data: { username: 'test-user' },
    });
    render(<FileListing disableSelection={false} />);

    const element = screen.getByText(/My Data/i);
    expect(document.body.contains(element)).toBe(true); // Ensure it's in the document
  });

  it.skip('handles system selection correctly', () => {
    const mockOnFolderSelect = jest.fn();

    (useGetSystems as jest.Mock).mockReturnValue({
      data: {
        systems: [{ id: 'designsafe.storage.default' }],
        myDataSystem: { id: 'designsafe.storage.default' },
      },
      isFetched: true,
      isLoading: false,
    });

    (useFiles as jest.Mock).mockReturnValue({
      data: [],
      refetch: jest.fn(),
    });
    (useDesignSafeProjects as jest.Mock).mockReturnValue({
      data: [],
    });
    (useAuthenticatedUser as jest.Mock).mockReturnValue({
      data: { username: 'test-user' },
    });
    render(
      <FileListing
        disableSelection={false}
        onFolderSelect={mockOnFolderSelect}
      />
    );

    const systemElement = screen.getByText(/My Data/i);
    fireEvent.click(systemElement);

    expect(mockOnFolderSelect).toHaveBeenCalledWith('test-user');
    expect(document.body.contains(systemElement)).toBe(true);
  });

  it.skip('updates files when the selected system changes', () => {
    const mockFiles = [
      {
        path: 'file1.txt',
        name: 'file1.txt',
        length: 100,
        lastModified: '2025-01-01',
        type: 'file',
      },
    ];

    (useGetSystems as jest.Mock).mockReturnValue({
      data: {
        systems: [{ id: 'designsafe.storage.default' }],
        myDataSystem: { id: 'designsafe.storage.default' },
      },
      isFetched: true,
      isLoading: false,
    });

    (useFiles as jest.Mock).mockReturnValue({
      data: mockFiles,
      refetch: jest.fn(),
    });

    (useDesignSafeProjects as jest.Mock).mockReturnValue({
      data: [],
    });

    (useAuthenticatedUser as jest.Mock).mockReturnValue({
      data: { username: 'test-user' },
    });

    (serializeToChonkyFile as jest.Mock).mockImplementation((file) => ({
      id: file.path,
      name: file.name,
      isDir: false,
    }));

    render(<FileListing disableSelection={false} />);

    expect(FileBrowser).toHaveBeenCalledWith(
      expect.objectContaining({
        files: [
          expect.objectContaining({
            id: 'file1.txt',
            name: 'file1.txt',
            isDir: false,
          }),
        ],
      }),
      expect.anything()
    );

    expect(serializeToChonkyFile).toHaveBeenCalledWith(mockFiles[0], []);
    expect(serializeToChonkyFile).toHaveBeenCalledTimes(2);
  });

  it.skip('shows an error message when the system is not found', () => {
    (useGetSystems as jest.Mock).mockReturnValue({
      data: {
        systems: [{ id: 'designsafe.storage.default' }],
        myDataSystem: { id: 'designsafe.storage.default' },
      },
      isFetched: true,
      isLoading: false,
    });

    (useFiles as jest.Mock).mockReturnValue({
      data: [],
      refetch: jest.fn(),
    });

    (useDesignSafeProjects as jest.Mock).mockReturnValue({
      data: [],
    });

    (useAuthenticatedUser as jest.Mock).mockReturnValue({
      data: { username: 'test-user' },
    });

    render(<FileListing disableSelection={false} />);

    const errorElement = screen.getByText(/No systems available/i);
    expect(document.body.contains(errorElement)).toBe(true);
  });

  it.skip('should change selectedSystemId when select item changes', async () => {
    (useGetSystems as jest.Mock).mockReturnValue({
      data: {
        systems: [{ id: 'designsafe.storage.default' }],
        myDataSystem: { id: 'designsafe.storage.default' },
      },
      isFetched: true,
      isLoading: false,
    });
    (useAuthenticatedUser as jest.Mock).mockReturnValue({
      data: { username: 'test-user' },
    });
    (useFiles as jest.Mock).mockReturnValue({
      data: [],
      refetch: jest.fn(),
    });

    const TestComponent = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <FileListing disableSelection={false} />
        </FormProvider>
      );
    };

    render(<TestComponent />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'system2' } });

    await waitFor(() => {
      expect((select as HTMLSelectElement).value).toBe('system2');
    });
  });
});
