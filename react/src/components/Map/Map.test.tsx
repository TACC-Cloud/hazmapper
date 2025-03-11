import React from 'react';
import { renderInTest } from '@hazmapper/test/testUtil';
import Map from './Map';
import { tileServerLayers } from '../../__fixtures__/tileServerLayerFixture';
import { MapPositionProvider } from '@hazmapper/context/MapContext';
import { useForm, FormProvider } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { tileLayerSchema } from '@hazmapper/pages/MapProject';

test('renders map', () => {
  const Wrapper = () => {
    const formSchema = z.object({
      tileLayers: z.array(
        z.object({
          layer: tileLayerSchema, // Need to nest tile layer here since useFieldArray will add it's own `id` field, overwriting our own
        })
      ),
    });

    const methods = useForm({
      defaultValues: tileServerLayers,
      resolver: zodResolver(formSchema),
      mode: 'onChange',
    });

    return (
      <FormProvider {...methods}>
        <MapPositionProvider>
          <Map />
        </MapPositionProvider>
      </FormProvider>
    );
  };

  const { getByText } = renderInTest(<Wrapper />);
  expect(getByText(/Leaflet/)).toBeDefined();
});
