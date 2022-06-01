export const featureTypes = ['image', 'video', 'point_cloud', 'streetview', 'no_asset_vector'] as const;

type featuresTypeID = typeof featureTypes[number];

export const featureTypeLabels: Record<featuresTypeID, string> = {
  image: 'Images',
  video: 'Videos',
  point_cloud: 'Point Clouds',
  streetview: 'Streetview',
  no_asset_vector: 'No Asset Vector'
} as const;
