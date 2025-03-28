import { Feature } from '@hazmapper/types';

/**
 * Get a short display name for a feature.
 * Assumes a single asset (i.e. not a FeatureType.Collection).
 */
export const shortDisplayText = (feature: Feature): string => {
  const asset = feature?.assets?.[0];

  if (asset?.display_path) {
    return asset.display_path.split('/').pop() || String(feature.id);
  }

  return asset?.id?.toString() ?? String(feature.id);
};

/**
 * Get sequence id
 *
 *   Note: Feature needs to be FeatureType.Streetview
 */
export const getSequenceID = (feature: Feature): string => {
  const sequenceId = feature.assets[0].display_path.split('/').pop();
  return sequenceId || '';
};
