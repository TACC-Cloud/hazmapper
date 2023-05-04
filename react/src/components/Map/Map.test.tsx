import React from 'react';
import { render } from '@testing-library/react';
import Map from './Map';
import { tileServerLayers } from '../../__fixtures__/tileServerLayerFixture';
import { featureCollection } from '../../__fixtures__/featuresFixture';

test('renders map', () => {
  const { getByText } = render(
    <Map baseLayers={tileServerLayers} featureCollection={featureCollection} />
  );
  expect(getByText(/Map/)).toBeDefined();
});
