import React, { useState } from 'react';
import DOMPurify from 'dompurify';
// import { Button } from '@tacc/core-components';
import { Button } from 'antd';
import { Feature, FeatureType } from '@hazmapper/types';
import {
  getFeatureType,
  IFileImportRequest,
  TapisFilePath,
} from '@hazmapper/types';
import {
  useImportFeatureAsset,
  useNotification,
  useFeatureAssetSourcePath,
} from '@hazmapper/hooks';
import FileBrowserModal from '../FileBrowserModal/FileBrowserModal';
import { IMPORTABLE_FEATURE_ASSET_TYPES } from '@hazmapper/utils/fileUtils';

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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const featureType = getFeatureType(selectedFeature);
  const projectId = selectedFeature.project_id;
  const notification = useNotification();
  const featureId = selectedFeature.id;
  const { mutate: importFeatureAsset, isPending: isImporting } =
    useImportFeatureAsset(projectId, featureId);
  const getFeatureAssetSourcePath = useFeatureAssetSourcePath(selectedFeature);
  const featureAssetSourcePath = getFeatureAssetSourcePath();

  const handleSubmit = (files: TapisFilePath[]) => {
    for (const file of files) {
      const importData: IFileImportRequest = {
        system_id: file.system,
        path: file.path,
      };
      importFeatureAsset(importData, {
        onSuccess: () => {
          setIsModalOpen(false);
          notification.success({
            description: `Your asset import for feature ${selectedFeature.id} was successful.`,
          });
        },
        onError: (error) => {
          setIsModalOpen(false);
          notification.success({
            description: `There was an error importing your asset for feature ${selectedFeature.id}. Error: ${error}`,
          });
        },
      });
    }
  };

  return (
    <>
      {featureType === FeatureType.Image && (
        <Button
          type="primary"
          href={featureAssetSourcePath}
          download={`feature-${selectedFeature.id}.jpeg`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download
        </Button>
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
          disabled={isImporting}
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
          isSingleSelectMode={true}
          singleSelectErrorMessage="Adding multiple assets to a feature is not supported."
        />
      )}
    </>
  );
};

export default AssetButton;
