import React from 'react';
import { renderInTestWaitForQueries, server } from '@hazmapper/test/testUtil';
import Map from './Map';
import { tileServerLayers } from '../../__fixtures__/tileServerLayerFixture';
import { MapPositionProvider } from '@hazmapper/context/MapContext';
import { MapillaryTokenProvider } from '@hazmapper/context/MapillaryTokenProvider';
import { MapillaryViewerProvider } from '@hazmapper/context/MapillaryViewerContextProvider';
import { useForm, FormProvider } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { tileLayerSchema } from '@hazmapper/pages/MapProject';
import { http, HttpResponse } from 'msw';

server.use(
  http.get('https://geoapi.unittest/streetview/services/', () =>
    HttpResponse.json([], { status: 200 })
  )
);

test('renders map', async () => {
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
          <MapillaryTokenProvider>
            <MapillaryViewerProvider>
              <Map />
            </MapillaryViewerProvider>
          </MapillaryTokenProvider>
        </MapPositionProvider>
      </FormProvider>
    );
  };

  const { getByText } = await renderInTestWaitForQueries(<Wrapper />);
  expect(getByText(/Leaflet/)).toBeDefined();
});
