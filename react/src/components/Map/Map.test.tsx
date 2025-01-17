import React from 'react';
import { renderInTest } from '@hazmapper/test/testUtil';
import Map from './Map';
import { tileServerLayers } from '../../__fixtures__/tileServerLayerFixture';
import { featureCollection } from '../../__fixtures__/featuresFixture';
import { MapPositionProvider } from '@hazmapper/context/MapContext';

test('renders map', () => {
  const { getByText } = renderInTest(
    <MapPositionProvider>
      <Map
        baseLayers={tileServerLayers}
        featureCollection={featureCollection}
      />
    </MapPositionProvider>
  );
  expect(getByText(/Map/)).toBeDefined();
});
