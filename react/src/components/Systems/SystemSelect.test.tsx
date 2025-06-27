import React from 'react';
import { render, screen } from '@testing-library/react';
import { SystemSelect } from './SystemSelect';
import systemsFixture from './Systems.fixture';

jest.mock('../../hooks', () => ({
  useDesignSafeProjects: jest.fn(() => ({ result: [] })),
  useDesignSafePublishedProjects: jest.fn(() => ({ result: [] })),
  useGetSystems: jest.fn(() => ({
    data: {
      systems: systemsFixture,
      myDataSystem: { id: 'designsafe.storage.default' },
      communityDataSystem: { id: 'designsafe.storage.community' },
      publishedDataSystem: { id: 'designsafe.storage.published' },
    },
    isFetching: true,
  })),
}));

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

describe('System Select', () => {
  const renderComponent = (showPublicSystems = true) => {
    return render(
      <SystemSelect
        className="class-name"
        showPublicSystems={showPublicSystems}
      />
    );
  };

  it('displays system select dropdown with correct values', () => {
    renderComponent();
    expect(screen.getByText('My Data')).toBeDefined();
    expect(screen.getByText('Community Data')).toBeDefined();
  });

  it('calls onSystemSelect with deafult value', () => {
    renderComponent();
    const select = screen.getByRole('combobox');
    expect((select as HTMLSelectElement).value).toBe(
      'designsafe.storage.default'
    );
  });

  it('does not display public systems when showPublicSystems is false', () => {
    renderComponent(false);
    expect(screen.getByText('My Data')).toBeDefined();
    expect(screen.queryByText('Community Data')).toBeNull();
  });
});
