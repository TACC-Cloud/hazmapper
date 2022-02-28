export const featureTypes = ['image', 'video', 'point_cloud', 'no_asset_vector'] as const;

type featuresTypeID = typeof featureTypes[number];

export const featureTypeLabels: Record<featuresTypeID, string> = {
  image: 'Images',
  video: 'Videos',
  point_cloud: 'Point Clouds',
  no_asset_vector: 'No Asset Vector'
} as const;