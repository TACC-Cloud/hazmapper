import React, { useEffect } from 'react';
import { Flex, Button, Tooltip } from 'antd';
import { PlayCircleOutlined, ExportOutlined } from '@ant-design/icons';
import { Feature } from '@hazmapper/types';
import {
  useMapillaryUserConnection,
  useMapillaryViewer,
} from '@hazmapper/hooks';

type MapillaryViewerButtonProps = {
  sequenceId: string;
  mapillaryFirstImageId: string;
};

const MapillaryViewerButton: React.FC<MapillaryViewerButtonProps> = ({
  sequenceId,
  mapillaryFirstImageId,
}) => {
  const { data: mapillaryConnection } = useMapillaryUserConnection();

  const { setShow, setImageId, setSequenceId } = useMapillaryViewer();

  const hasMapillaryToken = !!mapillaryConnection?.token;

  useEffect(() => {
    // reset/init the mapillary viwer
    setImageId(mapillaryFirstImageId);
    setSequenceId(sequenceId);
  }, [
    hasMapillaryToken,
    sequenceId,
    mapillaryFirstImageId,
    setImageId,
    setSequenceId,
  ]);

  return (
    <Flex justify="center" style={{ marginTop: '1rem' }}>
      <Tooltip
        title={
          hasMapillaryToken ? 'View' : 'Log in to Mapillary to use this feature'
        }
      >
        {/* To allow tooltips on disabled buttons, wrap inside span */}
        <span>
          <Button
            type="primary"
            style={{ width: 'fit-content' }}
            icon={<PlayCircleOutlined />}
            onClick={() => setShow(true)}
            disabled={!hasMapillaryToken}
          >
            Open
          </Button>
        </span>
      </Tooltip>
    </Flex>
  );
};

type AssetStreetviewProps = {
  isPublicView: boolean;
  feature: Feature;
};

const AssetStreetview: React.FC<AssetStreetviewProps> = ({
  isPublicView,
  feature,
}) => {
  const sequenceId = feature.assets[0].display_path.split('/').pop();
  const mapillaryFirstImageId = feature.assets[0].original_name;

  const mapillaryHref =
    'https://www.mapillary.com/app/?pKey=' + mapillaryFirstImageId;

  return (
    <Flex vertical style={{ width: '90%' }}>
      <iframe
        src={`https://www.mapillary.com/embed?image_key=${mapillaryFirstImageId}&style=photo`}
        title={`Mapillary sequence ${sequenceId}`}
        height="100%"
        width="100%"
      ></iframe>
      {/* Only for non-public-view of map where a logged-in users could potentially have mapillary auth */}
      {!isPublicView && sequenceId && mapillaryFirstImageId && (
        <MapillaryViewerButton
          sequenceId={sequenceId}
          mapillaryFirstImageId={mapillaryFirstImageId}
        />
      )}
      <Flex justify="center" style={{ marginTop: '1rem' }}>
        <Button
          type="primary"
          href={mapillaryHref}
          target="_blank"
          rel="noreferrer"
          style={{ width: 'fit-content' }}
          icon={<ExportOutlined />}
        >
          Open in Mapillary
        </Button>
      </Flex>
    </Flex>
  );
};
export default AssetStreetview;
