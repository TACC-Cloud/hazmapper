export const featureTypes = ['image', 'video', 'point_cloud'] as const;

type featuresTypeID = typeof featureTypes[number];

export const featureTypeLabels: Record<featuresTypeID, string> = {
  image: 'Images',
  video: 'Videos',
  point_cloud: 'Point Clouds'
} as const;