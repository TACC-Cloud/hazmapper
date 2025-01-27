import React from 'react';
import DOMPurify from 'dompurify';
import { Button } from '@tacc/core-components';
import { Feature, FeatureType } from '@hazmapper/types';
import { getFeatureType, IFileImportRequest } from '@hazmapper/types';
import { useImportFeatureAsset } from '@hazmapper/hooks';

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
  const projectId = selectedFeature.project_id;
  const featureId = selectedFeature.id;
  const {
    mutate: importFeatureAsset,
    isPending: isImporting,
    isSuccess: isImportingSuccess,
  } = useImportFeatureAsset(projectId, featureId);

  const handleImportFeatureAsset = (importData: IFileImportRequest) => {
    importFeatureAsset(importData);
  };
  const handleSubmit = () => {
    const importData: IFileImportRequest = {
      /*TODO Replace with passed in values from
      FileBrowserModal. These are hardcoded to test.*/
      system_id: 'project-4072868216578445806-242ac117-0001-012',
      path: 'images_good/image.jpg',
    };
    handleImportFeatureAsset(importData);
  };

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
        <Button
          type="primary"
          onClick={handleSubmit}
          isLoading={isImporting}
          disabled={isImportingSuccess}
        >
          Add Asset from DesignSafe
        </Button>
      )}
    </>
  );
};

export default AssetButton;
