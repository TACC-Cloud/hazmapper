import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { Button } from '@tacc/core-components';
import { Feature, FeatureType } from '@hazmapper/types';
import {
  getFeatureType,
  IFileImportRequest,
  TapisFilePath,
} from '@hazmapper/types';
import { useImportFeatureAsset } from '@hazmapper/hooks';
import FileBrowserModal from '../FileBrowserModal/FileBrowserModal';
import { IMPORTABLE_FEATURE_ASSET_TYPES } from '@hazmapper/utils/fileUtils';

type AssetButtonProps = {
  selectedFeature: Feature;
  featureSource: string;
  isPublicView: boolean;
  onQuestionnaireClick?: () => void;
  onAssetUpdate?: (updatedFeature: Feature) => void;
};

const AssetButton: React.FC<AssetButtonProps> = ({
  selectedFeature,
  featureSource,
  isPublicView,
  onQuestionnaireClick,
  onAssetUpdate,
}) => {
  const pointCloudURL = DOMPurify.sanitize(featureSource + '/index.html');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const featureType = getFeatureType(selectedFeature);
  const projectId = selectedFeature.project_id;
  const featureId = selectedFeature.id;
  const {
    mutate: importFeatureAsset,
    isPending: isImporting,
    isSuccess: isImportingSuccess,
  } = useImportFeatureAsset(projectId, featureId);

  const handleImportFeatureAsset = (importData: IFileImportRequest) => {
    importFeatureAsset(importData, {
      onSuccess: (updatedFeature) => {
        onAssetUpdate?.(updatedFeature);
        setIsModalOpen(false);
      },
    });
  };
  const handleSubmit = (files: TapisFilePath[]) => {
    const importRequests: IFileImportRequest[] = files.map((file) => ({
      system_id: file.system,
      path: file.path,
    }));
    importRequests.forEach(handleImportFeatureAsset);
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
          onClick={() => setIsModalOpen(true)}
          isLoading={isImporting}
          disabled={isImportingSuccess}
        >
          Add Asset from DesignSafe
        </Button>
      )}
      {isModalOpen && (
        <FileBrowserModal
          isOpen={isModalOpen}
          toggle={() => setIsModalOpen(false)}
          onImported={handleSubmit}
          allowedFileExtensions={IMPORTABLE_FEATURE_ASSET_TYPES}
        />
      )}
    </>
  );
};

export default AssetButton;
