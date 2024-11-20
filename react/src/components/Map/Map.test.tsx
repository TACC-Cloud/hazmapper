import React from 'react';
import { renderInTest } from '@hazmapper/test/testUtil';
import Map from './Map';
import { tileServerLayers } from '../../__fixtures__/tileServerLayerFixture';
import { featureCollection } from '../../__fixtures__/featuresFixture';

test('renders map', () => {
  const { getByText } = renderInTest(
    <Map baseLayers={tileServerLayers} featureCollection={featureCollection} />
  );
  expect(getByText(/Map/)).toBeDefined();
});
