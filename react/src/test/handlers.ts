import { http, HttpResponse } from 'msw';
import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';
import { systems } from '@hazmapper/__fixtures__/systemsFixture';
import { featureCollection } from '@hazmapper/__fixtures__/featuresFixture';

// ArcGIS tiles GET
export const arcgis_tiles = http.get('https://tiles.arcgis.com/*', () => {
  return HttpResponse.text('dummy');
});

// DesignSafe Projects GET
export const designsafe_projects = http.get(
  `${testDevConfiguration.designsafePortalUrl}/api/projects/v2/`,
  () => HttpResponse.json({ results: [] }, { status: 200 })
);

// GeoAPI Projects GET
export const geoapi_projects_list = http.get(
  `${testDevConfiguration.geoapiUrl}/projects/`,
  () => HttpResponse.json({}, { status: 200 })
);

// GeoAPI Project Features GET
export const geoapi_project_features = http.get(
  `${testDevConfiguration.geoapiUrl}/projects/:projectId/features/`,
  () => HttpResponse.json(featureCollection, { status: 200 })
);

// Tapis Systems GET
export const tapis_systems = http.get(
  `${testDevConfiguration.tapisUrl}/v3/systems/`,
  () => HttpResponse.json(systems, { status: 200 })
);

// Tapis Files GET
export const tapis_files_listing = http.get(
  `${testDevConfiguration.tapisUrl}/v3/files/listing/*`,
  () =>
    HttpResponse.json(
      {
        status: 'success',
        result: [],
      },
      { status: 200 }
    )
);

// Export all handlers together for server setup
export const defaultHandlers = [
  arcgis_tiles,
  designsafe_projects,
  geoapi_projects_list,
  geoapi_project_features,
  tapis_files_listing,
  tapis_systems,
];
