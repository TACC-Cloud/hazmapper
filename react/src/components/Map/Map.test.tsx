import React from 'react';
import { render } from '@testing-library/react';
import Map from './Map';
import { tileServerLayers } from '../../__fixtures__/tileServerLayerFixture';
import { featureCollection } from '../../__fixtures__/featuresFixture';
import { server } from '@hazmapper/testUtil';
import { http, HttpResponse } from 'msw';

test('renders map', () => {
  server.use(
    http.get('https://tiles.arcgis.com/*', () => {
      return HttpResponse.text('dummy');
    })
  );

  const { getByText } = render(
    <Map baseLayers={tileServerLayers} featureCollection={featureCollection} />
  );
  expect(getByText(/Map/)).toBeDefined();
});
