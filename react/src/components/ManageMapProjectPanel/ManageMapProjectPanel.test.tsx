import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import ManageMapProjectPanel from './ManageMapProjectPanel';
import { projectMock } from '@hazmapper/__fixtures__/projectFixtures';
import { renderInTest, testQueryClient } from '@hazmapper/test/testUtil';

// Mock the child components
jest.mock('./MapTabContent', () => {
  return function MockMapTabContent() {
    return <div data-testid="map-tab-content">Map Tab Content</div>;
  };
});

jest.mock('./MembersTabContent', () => {
  return function MockMembersTabContent() {
    return <div data-testid="members-tab-content">Members Tab Content</div>;
  };
});

jest.mock('./PublicTabContent', () => {
  return function MockPublicTabContent() {
    return <div data-testid="public-tab-content">Public Tab Content</div>;
  };
});

jest.mock('./SaveTabContent', () => {
  return function MockSaveTabContent() {
    return <div data-testid="save-tab-content">Save Tab Content</div>;
  };
});

describe('ManageMapProjectPanel', () => {
  const defaultProps = {
    project: projectMock,
    onProjectUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    testQueryClient.clear();
  });

  it('renders all tab buttons', () => {
    renderInTest(<ManageMapProjectPanel {...defaultProps} />);

    expect(screen.getByRole('tab', { name: 'Map' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Members' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Public' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Save' })).toBeTruthy();
  });

  it('renders map tab content by default', () => {
    renderInTest(<ManageMapProjectPanel {...defaultProps} />);

    expect(screen.getByTestId('map-tab-content')).toBeTruthy();
  });
  it('switches between tabs correctly', () => {
    renderInTest(<ManageMapProjectPanel {...defaultProps} />);

    // Click Members tab
    const membersTab = screen.getByRole('tab', { name: 'Members' });
    fireEvent.click(membersTab);
    expect(screen.getByTestId('members-tab-content')).toBeTruthy();

    // Click Public tab
    const publicTab = screen.getByRole('tab', { name: 'Public' });
    fireEvent.click(publicTab);
    expect(screen.getByTestId('public-tab-content')).toBeTruthy();

    // Click Save tab
    const saveTab = screen.getByRole('tab', { name: 'Save' });
    fireEvent.click(saveTab);
    expect(screen.getByTestId('save-tab-content')).toBeTruthy();
  });
});
