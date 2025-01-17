import { renderHook, waitFor } from '@testing-library/react';
import { useFeatures, useCurrentFeatures } from './useFeatures';
import { featureCollection } from '@hazmapper/__fixtures__/featuresFixture';
import { TestWrapper, testQueryClient } from '@hazmapper/test/testUtil';

describe('Feature Hooks', () => {
  afterEach(() => {
    testQueryClient.clear();
  });

  it('useFeatures should fetch features', async () => {
    const { result } = renderHook(
      () =>
        useFeatures({
          projectId: 80,
          isPublicView: false,
          assetTypes: ['image'],
        }),
      { wrapper: TestWrapper }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(featureCollection);
  });

  it('useCurrentFeatures should return cached features', async () => {
    // First, populate the cache with a features query
    const { result: featuresResult } = renderHook(
      () =>
        useFeatures({
          projectId: 80,
          isPublicView: false,
          assetTypes: ['image'],
        }),
      { wrapper: TestWrapper }
    );

    await waitFor(() => {
      expect(featuresResult.current.isSuccess).toBe(true);
    });

    // Now test useCurrentFeatures
    const { result: currentResult } = renderHook(() => useCurrentFeatures(), {
      wrapper: TestWrapper,
    });

    expect(currentResult.current.isLatestQueryPending).toBe(false);
    expect(currentResult.current.isLatestQueryError).toBe(false);
    expect(currentResult.current.data).toEqual(featureCollection);
  });
});
