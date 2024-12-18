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

  if (fileType === 'point_cloud') {
    return (
      <>
        <a href={pointCloudURL} target="_blank" rel="noreferrer">
          <Button type="primary">View</Button>
        </a>
      </>
    );
  }
  if (fileType === 'questionnaire') {
    //TODO
    return <Button type="primary">View</Button>;
  }
  if (fileType.includes(selectedFeature.geometry.type)) {
    if (isPublicView) {
      //TODO
      return <Button type="primary">Add Asset from DesignSafe</Button>;
    }
  } else {
    return null;
  }
};

export default AssetButton;
