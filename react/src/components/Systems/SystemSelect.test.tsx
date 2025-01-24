import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemSelect } from './SystemSelect';
import systemsFixture from './Systems.fixture';

jest.mock('../../hooks', () => ({
  useDsProjects: jest.fn(() => ({ result: [] })),
  useSystems: jest.fn(() => ({
    data: systemsFixture,
    myDataSystem: { id: 'designsafe.storage.default' },
    communityDataSystem: { id: 'designsafe.storage.community' },
    publishedDataSystem: { id: 'designsafe.storage.published' },
  })),
}));

describe('System Select', () => {
  const mockOnSystemSelect = jest.fn();

  const renderComponent = (showPublicSystems = true) => {
    return render(
      <SystemSelect
        onSystemSelect={mockOnSystemSelect}
        className="class-name"
        showPublicSystems={showPublicSystems}
      ></SystemSelect>
    );
  };

  it('displays system select dropdown with correct values', () => {
    renderComponent();
    expect(screen.getByText('My Data')).toBeDefined();
    expect(screen.getByText('Community Data')).toBeDefined();
    expect(screen.getByText('Published Data')).toBeDefined();
  });

  it('calls onSystemSelect with deafult value', () => {
    renderComponent();

    expect(mockOnSystemSelect).toHaveBeenCalledWith(
      'designsafe.storage.default'
    );
  });

  it('calls onSystemSelect correctly on option change', () => {
    renderComponent();

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'designsafe.storage.community' },
    });
    expect(mockOnSystemSelect).toHaveBeenCalledWith(
      'designsafe.storage.community'
    );
  });

  it('does not display public systems when showPublicSystems is false', () => {
    renderComponent(false);
    expect(screen.getByText('My Data')).toBeDefined();
    expect(screen.queryByText('Community Data')).toBeNull();
    expect(screen.queryByText('Published Data')).toBeNull();
  });
});
