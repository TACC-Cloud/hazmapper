import { renderHook, waitFor } from '@testing-library/react';
import { useFeatures, useCurrentFeatures } from './useFeatures';
import { featureCollection } from '@hazmapper/__fixtures__/featuresFixture';
import {
  TestWrapper,
  WithUseFeatureManager,
  testQueryClient,
} from '@hazmapper/test/testUtil';
import '@testing-library/jest-dom';

export const TestWrapperWithUseFeatureManager = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <TestWrapper>
    <WithUseFeatureManager>{children}</WithUseFeatureManager>
  </TestWrapper>
);

describe('Feature Hooks', () => {
  afterEach(() => {
    testQueryClient.clear();
  });

  it('useFeatures should fetch features', async () => {
    const { result } = renderHook(
      () =>
        useFeatures({
          projectId: 80,
          assetTypes: ['image'],
        }),
      { wrapper: TestWrapperWithUseFeatureManager }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(featureCollection);
  });

  it('useCurrentFeatures should return cached features', async () => {
    // Now test useCurrentFeatures
    const { result: currentResult } = renderHook(() => useCurrentFeatures(), {
      wrapper: TestWrapperWithUseFeatureManager,
    });

    await waitFor(() => {
      expect(currentResult.current).not.toBeNull();
    });

    await waitFor(() => {
      expect(currentResult.current.data).toEqual(featureCollection);
      expect(currentResult.current.isFetching).toBe(false);
      expect(currentResult.current.isError).toBe(false);
    });
  });
});
