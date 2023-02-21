import React from 'react';
import Map from '../Map';
import { tileServerLayers } from '../../__fixtures__/tileServerLayerFixture';
import { featureCollection } from '../../__fixtures__/featuresFixture';

interface Props {
  /**
   * Whether or not the map project is public.
   * @default false
   */
  isPublic?: boolean;
}

/**
 * A component that displays a map project (a map and related data)
 */
export default class MapProject extends React.Component<Props> {
  static defaultProps: Props = {
    isPublic: false,
  };

  render() {
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        {/* TODO for above and project, should we use style-components and/or CSS modules? */}
        <Map
          baseLayers={tileServerLayers}
          featureCollection={featureCollection}
        />
      </div>
    );
  }
}
