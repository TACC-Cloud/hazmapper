import React from 'react';
import { Flex, Button, Spin } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { Feature } from '@hazmapper/types';
import { useMapillaryFirstImageId } from '@hazmapper/hooks/streetview';

type AssetStreetviewProps = {
  feature: Feature;
};

const AssetStreetview: React.FC<AssetStreetviewProps> = ({ feature }) => {
  const sequenceId = feature.assets[0].display_path.split('/').pop();
  const { data: mapillaryImageId, isLoading: isLoadingMapillaryFirstImageId } =
    useMapillaryFirstImageId({
      sequenceId,
    });

  if (isLoadingMapillaryFirstImageId) {
    return <Spin />;
  }

  const mapillaryHref =
    'https://www.mapillary.com/app/?pKey=' + mapillaryImageId;

  return (
    <Flex vertical style={{ width: '90%' }}>
      <iframe
        src={`https://www.mapillary.com/embed?image_key=${mapillaryImageId}&style=photo`}
        title={`Mapillary sequence ${sequenceId}`}
        height="100%"
        width="100%"
      ></iframe>
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
