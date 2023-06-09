export const featureTypes = ['image', 'video', 'point_cloud', 'streetview', 'questionnaire', 'no_asset_vector'] as const;

type featuresTypeID = (typeof featureTypes)[number];

export const featureTypeLabels: Record<featuresTypeID, string> = {
  image: 'Images',
  video: 'Videos',
  point_cloud: 'Point Clouds',
  streetview: 'Streetview',
  questionnaire: 'Questionnaire',
  no_asset_vector: 'No Asset Vector',
} as const;

export const existingFeatures: Record<string, boolean> = {
  image: false,
  video: false,
  point_cloud: false,
  streetview: false,
  questionnaire: false,
  no_asset_vector: false,
} as const;
