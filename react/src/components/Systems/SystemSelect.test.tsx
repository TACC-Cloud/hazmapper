import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SystemSelect } from './SystemSelect';
import systemsFixture from './Systems.fixture';

jest.mock('../../hooks', () => {
  return {
    useSystems: () => {
      return {
        data: systemsFixture,
      };
    },
  };
});

describe('System Select', () => {
  const mockOnSystemSelect = jest.fn();

  const renderComponent = () => {
    return render(
      <SystemSelect onSystemSelect={mockOnSystemSelect}></SystemSelect>
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
});
