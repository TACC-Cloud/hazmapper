import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import FileBrowserModal from './FileBrowserModal';
import { renderInTest } from '@hazmapper/test/testUtil';
import '@testing-library/jest-dom';

// TODO see if we don't have to mock chonky
jest.mock('chonky', () => ({
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
  ChonkyActions: {
    EnableListView: { id: 'enable-list-view' },
    OpenFiles: { id: 'open-files' },
    MouseClickFile: { id: 'mouse-click-file' },
    ChangeSelection: { id: 'change-selection' },
  },
}));

describe('FileBrowserModal', () => {
  const defaultProps = {
    isOpen: true,
    toggle: jest.fn(),
    onImported: jest.fn(),
    allowedFileExtensions: ['.foo', '.bar'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', async () => {
    renderInTest(<FileBrowserModal {...defaultProps} />);

    // Wait for systems data to load
    await waitFor(() => {
      expect(screen.getByText('Select Files')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Allowed file types: .foo, .bar')
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Note: Only files are selectable, not folders. Double-click on a folder to navigate into it.'
      )
    ).toBeInTheDocument();

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();

    const importButton = screen
      .getByText('Import')
      .closest('button') as HTMLButtonElement;
    expect(importButton).toBeDisabled();
  });

  it('handles cancel action correctly', async () => {
    renderInTest(<FileBrowserModal {...defaultProps} />);

    // Wait for systems data to load
    await waitFor(() => {
      expect(screen.getByText('Select Files')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.toggle).toHaveBeenCalled();
  });
});
