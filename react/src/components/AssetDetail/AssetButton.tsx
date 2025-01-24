import React from 'react';
import DOMPurify from 'dompurify';
import { Button } from '@tacc/core-components';
import { Feature, FeatureType } from '@hazmapper/types';
import { getFeatureType } from '@hazmapper/types';

type AssetButtonProps = {
  selectedFeature: Feature;
  featureSource: string;
  isPublicView: boolean;
  onQuestionnaireClick?: () => void;
};

const AssetButton: React.FC<AssetButtonProps> = ({
  selectedFeature,
  featureSource,
  isPublicView,
  onQuestionnaireClick,
}) => {
  const pointCloudURL = DOMPurify.sanitize(featureSource + '/index.html');

  const featureType = getFeatureType(selectedFeature);

  return (
    <>
      {featureType === FeatureType.Image && (
        <Button /*TODO add Download*/ type="primary">Download</Button>
      )}
      {featureType === FeatureType.PointCloud && (
        <a href={pointCloudURL} target="_blank" rel="noreferrer">
          <Button type="primary">View</Button>
        </a>
      )}
      {featureType === FeatureType.Questionnaire && (
        <Button type="primary" onClick={onQuestionnaireClick}>
          View
        </Button>
      )}
      {featureType.includes(selectedFeature.geometry.type) && !isPublicView && (
        //TODO
        <Button type="primary">Add Asset from DesignSafe</Button>
      )}
    </>
  );
};

export default AssetButton;
