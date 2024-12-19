import React from 'react';
import DOMPurify from 'dompurify';
import { Button } from '@tacc/core-components';
import { Feature } from '@hazmapper/types';
import { getFeatureType } from '@hazmapper/types';

type AssetButtonProps = {
  selectedFeature: Feature;
  featureSource: string;
  isPublicView: boolean;
};

const AssetButton: React.FC<AssetButtonProps> = ({
  selectedFeature,
  featureSource,
  isPublicView,
}) => {
  const pointCloudURL = DOMPurify.sanitize(featureSource + '/index.html');

  const fileType = getFeatureType(selectedFeature);
  if (fileType === 'image') {
    return <Button /*TODO add Download*/ type="primary">Download</Button>;
  }

  return (
    <>
      {fileType === 'point_cloud' && (
        <a href={pointCloudURL} target="_blank" rel="noreferrer">
          <Button type="primary">View</Button>
        </a>
      )}
      {fileType === 'questionnaire' && (
        //TODO
        <Button type="primary">View</Button>
      )}
      {fileType.includes(selectedFeature.geometry.type) && isPublicView && (
        //TODO
        <Button type="primary">Add Asset from DesignSafe</Button>
      )}
    </>
  );
};

export default AssetButton;
