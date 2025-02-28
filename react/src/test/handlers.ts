import { http, HttpResponse } from 'msw';
import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';
import { systems } from '@hazmapper/__fixtures__/systemsFixture';
import { featureCollection } from '@hazmapper/__fixtures__/featuresFixture';
import {
  projectMock,
  designSafeProjectMock,
} from '@hazmapper/__fixtures__/projectFixtures';
import { users } from '@hazmapper/__fixtures__/usersFixtures';
import { tileServerLayers } from '@hazmapper/__fixtures__/tileServerLayerFixture';
import { pointCloudMock } from '@hazmapper/__fixtures__/pointCloudFixtures';

// ArcGIS tiles GET
export const arcgis_tiles = http.get('https://tiles.arcgis.com/*', () => {
  return HttpResponse.text('dummy');
});

// DesignSafe Projects GET
export const designsafe_projects = http.get(
  `${testDevConfiguration.designsafePortalUrl}/api/projects/v2/`,
  () => HttpResponse.json({ results: [designSafeProjectMock] }, { status: 200 })
);

// DesignSafe (single) Project GET
export const designsafe_project = http.get(
  `${testDevConfiguration.designsafePortalUrl}/api/projects/v2/:designSafeProjectUUID/`,
  () =>
    HttpResponse.json({ baseProject: designSafeProjectMock }, { status: 200 })
);

// GeoAPI Projects GET - handles both list and single project (i.e query is "?uuid=uuid")
export const geoapi_get_projects = http.get(
  `${testDevConfiguration.geoapiUrl}/:projects_or_project_public_segment/`,
  ({ request }) => {
    const url = new URL(request.url);
    const uuid = url.searchParams.get('uuid');

    // If uuid is provided, return single project in array
    if (uuid) {
      return HttpResponse.json([projectMock], { status: 200 });
    }

    // No uuid means list all projects
    return HttpResponse.json([projectMock /* other projects */], {
      status: 200,
    });
  }
);

// GeoAPI Project Features GET
export const geoapi_project_features = http.get(
  `${testDevConfiguration.geoapiUrl}/:projects_or_project_public_segment/:projectId/features/`,
  () => HttpResponse.json(featureCollection, { status: 200 })
);

// GeoAPI Project Users GET
export const geoapi_project_users = http.get(
  `${testDevConfiguration.geoapiUrl}/projects/:projectId/users/`,
  () => HttpResponse.json(users, { status: 200 })
);

// GeoAPI Project Tile Servers GET
export const geoapi_project_tile_servers = http.get(
  `${testDevConfiguration.geoapiUrl}/:projects_or_project_public_segment/:projectId/tile-servers/`,
  () => HttpResponse.json(tileServerLayers, { status: 200 })
);

// GeoAPI Project Point Clouds GET
export const geoapi_project_point_clouds = http.get(
  `${testDevConfiguration.geoapiUrl}/projects/:projectId/point-cloud/`,
  () => HttpResponse.json([pointCloudMock], { status: 200 })
);

// GeoAPI Project Point Clouds POST
export const geoapi_project_point_clouds_create = http.post(
  `${testDevConfiguration.geoapiUrl}/projects/:projectId/point-cloud/`,
  () => HttpResponse.json([pointCloudMock], { status: 200 })
);

export const geoapi_project_point_clouds_delete = http.delete(
  `${testDevConfiguration.geoapiUrl}/projects/:projectId/point-cloud/:pointCloudId/`,
  async () => {
    return HttpResponse.json({}, { status: 200 });
  }
);

// Tapis Systems GET
export const tapis_systems = http.get(
  `${testDevConfiguration.tapisUrl}/v3/systems/`,
  () => HttpResponse.json(systems, { status: 200 })
);

// Tapis Files GET
export const tapis_files_listing = http.get(
  `${testDevConfiguration.tapisUrl}/v3/files/ops/*`,
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
  designsafe_project,
  designsafe_projects,
  geoapi_get_projects,
  geoapi_project_features,
  geoapi_project_users,
  geoapi_project_tile_servers,
  geoapi_project_point_clouds,
  geoapi_project_point_clouds_delete,
  tapis_files_listing,
  tapis_systems,
];
