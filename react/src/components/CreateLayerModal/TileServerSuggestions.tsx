import React from 'react';
import { Flex } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TileServerLayer } from '@hazmapper/types';
import { PrimaryButton } from '@hazmapper/common_components/Button';

const DEFAULT_TILE_SERVERS: ReadonlyArray<{
  description: string;
  tileServer: Omit<TileServerLayer, 'id'>;
}> = [
  {
    description: 'OpenStreetMap street map with roads, buildings, and labels.',
    tileServer: {
      name: 'Roads',
      type: 'tms',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      uiOptions: {
        opacity: 1,
        isActive: true,
        showDescription: false,
        showInput: false,
        zIndex: 0,
      },
      tileOptions: {
        minZoom: 0,
        maxZoom: 24,
        maxNativeZoom: 19,
      },
    },
  },
  {
    description: 'Esri world imagery with aerial and satellite photos.',
    tileServer: {
      name: 'Satellite',
      type: 'tms',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, \
      GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      uiOptions: {
        zIndex: 0,
        opacity: 1,
        isActive: true,
        showDescription: false,
        showInput: false,
      },
      tileOptions: {
        minZoom: 0,
        maxZoom: 24,
        maxNativeZoom: 19,
      },
    },
  },
];

type Props = {
  onImport: (tileServer: Omit<TileServerLayer, 'id'>) => void;
};

const TileServerSuggestions: React.FC<Props> = ({ onImport }) => {
  return (
    <>
      {DEFAULT_TILE_SERVERS.map(({ tileServer, description }, index) => (
        <Flex
          key={`suggestedTile${index}`}
          justify="space-between"
          align="center"
          style={{ marginBottom: '1.5rem' }}
        >
          <div>
            <span style={{ fontWeight: 500 }}>{tileServer.name}</span>
            <div style={{ color: '#888', fontSize: '0.85rem' }}>
              {description}
            </div>
          </div>
          <PrimaryButton onClick={() => onImport(tileServer)}>
            <PlusOutlined />
            Import
          </PrimaryButton>
        </Flex>
      ))}
    </>
  );
};

export default TileServerSuggestions;
