import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import FileBrowserModal from './FileBrowserModal';
import { renderInTest } from '@hazmapper/test/testUtil';
import '@testing-library/jest-dom';

// Mock FeatureFileTree component since it's a complex component and tested elswhere
jest.mock('@hazmapper/components/FeatureFileTree', () => {
  return function MockFeatureFileTree() {
    return <div data-testid="feature-file-tree">FeatureFileTree Component</div>;
  };
});

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

  it('renders correctly when open', () => {
    renderInTest(<FileBrowserModal {...defaultProps} />);

    expect(screen.getByText('Select Files')).toBeInTheDocument();

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

    // Import button should be disabled initially
    const importButton = screen
      .getByText('Import')
      .closest('button') as HTMLButtonElement;
    expect(importButton).toBeDisabled();
  });

  it('handles cancel action correctly', () => {
    renderInTest(<FileBrowserModal {...defaultProps} />);

    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));

    // Check if toggle was called
    expect(defaultProps.toggle).toHaveBeenCalled();
  });
});
