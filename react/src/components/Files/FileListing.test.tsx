import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileListing } from './FileListing';
import {
  useFiles,
  useAuthenticatedUser,
  useDsProjects,
  useSystems,
} from '../../hooks';
import { serializeToChonkyFile } from '../../utils/fileUtils';
import { FileBrowser } from 'chonky';

// Mock dependencies
jest.mock('../../hooks', () => ({
  useFiles: jest.fn(() => ({
    data: [],
    refetch: jest.fn(),
  })),
  useDsProjects: jest.fn(() => ({ result: [] })),
  useAuthenticatedUser: jest.fn(() => ({ data: { username: 'test-user' } })),
  useSystems: jest.fn(() => ({ data: [] })),
}));

jest.mock('../../utils/fileUtils', () => ({
  serializeToChonkyFile: jest.fn(),
}));

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

describe('FileListing', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing and displays "No systems available" if no systems are returned', () => {
    (useSystems as jest.Mock).mockReturnValue({ data: [], myDataSystem: null });
    (useDsProjects as jest.Mock).mockReturnValue({
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
    (useSystems as jest.Mock).mockReturnValue({
      data: [{ id: 'designsafe.storage.default' }],
      myDataSystem: { id: 'designsafe.storage.default' },
    });

    (useFiles as jest.Mock).mockReturnValue({
      data: [],
      refetch: jest.fn(),
    });
    (useDsProjects as jest.Mock).mockReturnValue({
      data: [],
    });
    (useAuthenticatedUser as jest.Mock).mockReturnValue({
      data: { username: 'test-user' },
    });
    render(<FileListing disableSelection={false} />);

    const element = screen.getByText(/My Data/i);
    expect(document.body.contains(element)).toBe(true); // Ensure it's in the document
  });

  it('handles system selection correctly', () => {
    const mockOnFolderSelect = jest.fn();

    (useSystems as jest.Mock).mockReturnValue({
      data: [{ id: 'designsafe.storage.default' }],
      myDataSystem: { id: 'designsafe.storage.default' },
    });

    (useFiles as jest.Mock).mockReturnValue({
      data: [],
      refetch: jest.fn(),
    });
    (useDsProjects as jest.Mock).mockReturnValue({
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

  it('updates files when the selected system changes', () => {
    const mockFiles = [
      {
        path: 'file1.txt',
        name: 'file1.txt',
        length: 100,
        lastModified: '2025-01-01',
        type: 'file',
      },
    ];

    (useSystems as jest.Mock).mockReturnValue({
      data: [{ id: 'designsafe.storage.default' }],
      myDataSystem: { id: 'designsafe.storage.default' },
    });

    (useFiles as jest.Mock).mockReturnValue({
      data: mockFiles,
      refetch: jest.fn(),
    });

    (useDsProjects as jest.Mock).mockReturnValue({
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

  it('shows an error message when the system is not found', () => {
    (useSystems as jest.Mock).mockReturnValue({
      data: [],
      myDataSystem: null,
    });

    (useFiles as jest.Mock).mockReturnValue({
      data: [],
      refetch: jest.fn(),
    });

    (useDsProjects as jest.Mock).mockReturnValue({
      data: [],
    });

    (useAuthenticatedUser as jest.Mock).mockReturnValue({
      data: { username: 'test-user' },
    });

    render(<FileListing disableSelection={false} />);

    const errorElement = screen.getByText(/No systems available/i);
    expect(document.body.contains(errorElement)).toBe(true);
  });
});
