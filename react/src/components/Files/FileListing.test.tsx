import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { FileListing } from './FileListing';
import {
  useFiles,
  useAuthenticatedUser,
  useDesignSafeProjects,
  useDesignSafePublishedProjects,
  useDesignSafePublishedProjectDetail,
  useGetSystems,
} from '../../hooks';
import { serializeToChonkyFile } from '../../utils/fileUtils';
import { FileBrowser } from '@aperturerobotics/chonky';
import { QueryClientProvider } from '@tanstack/react-query';
import { testQueryClient } from '@hazmapper/test/testUtil';
import { authenticatedUser } from '@hazmapper/__fixtures__/authStateFixtures';

// Mock dependencies
jest.mock('../../hooks', () => ({
  useFiles: jest.fn(() => ({
    data: [],
    refetch: jest.fn(),
  })),
  useDesignSafeProjects: jest.fn(() => ({ data: [] })),
  useDesignSafePublishedProjects: jest.fn(() => ({
    data: { result: [] },
    isFetching: false,
  })),
  useDesignSafePublishedProjectDetail: jest.fn(() => ({
    data: undefined,
    isSuccess: false,
  })),
  useAuthenticatedUser: jest.fn(() => ({ data: authenticatedUser })),
  useGetSystems: jest.fn(() => ({ data: { systems: [] } })),
}));

jest.mock('../../utils/fileUtils', () => ({
  serializeToChonkyFile: jest.fn(),
}));

// TODO see if we don't have to mock chonky
jest.mock('@aperturerobotics/chonky', () => {
  return {
    FileBrowser: jest.fn((props) => <div {...props}>Mock FileBrowser</div>),
    FileNavbar: jest.fn(() => <div>Mock FileNavbar</div>),
    FileList: jest.fn(() => <div>Mock FileList</div>),
    ChonkyActions: {
      EnableListView: { id: 'enable-list-view' },
      OpenFiles: { id: 'open-files' },
      MouseClickFile: { id: 'mouse-click-file' },
      ChangeSelection: { id: 'change-selection' },
    },
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
      data: authenticatedUser,
    });
    (useFiles as jest.Mock).mockReturnValue({ data: [] });
    render(
      <QueryClientProvider client={testQueryClient}>
        <FileListing disableSelection={false} />
      </QueryClientProvider>
    );

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
    (useDesignSafePublishedProjects as jest.Mock).mockReturnValue({
      data: [],
    });
    (useDesignSafePublishedProjectDetail as jest.Mock).mockReturnValue({
      data: undefined,
    });
    (useAuthenticatedUser as jest.Mock).mockReturnValue({
      data: authenticatedUser,
    });
    render(
      <QueryClientProvider client={testQueryClient}>
        <FileListing disableSelection={false} />
      </QueryClientProvider>
    );
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
      data: authenticatedUser,
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
      data: authenticatedUser,
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
      data: authenticatedUser,
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
      data: authenticatedUser,
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
