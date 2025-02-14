import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { Button } from '@tacc/core-components';
import { Feature, FeatureType } from '@hazmapper/types';
import {
  getFeatureType,
  IFileImportRequest,
  TapisFilePath,
} from '@hazmapper/types';
import { useImportFeatureAsset /*, useNotification*/ } from '@hazmapper/hooks';
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
  /* Uncomment when WG-422 polling is merged 
  const notification = useNotification();*/
  const featureId = selectedFeature.id;
  const {
    mutate: importFeatureAsset,
    isPending: isImporting,
    isSuccess: isImportingSuccess,
  } = useImportFeatureAsset(projectId, featureId);

  const handleSubmit = (files: TapisFilePath[]) => {
    for (const file of files) {
      const importData: IFileImportRequest = {
        system_id: file.system,
        path: file.path,
      };
      importFeatureAsset(importData, {
        onSuccess: () => {
          setIsModalOpen(false);
          /*Uncomment these notifications when WG-422 is merged
          notification.success({
            description: `Your asset was successful imported for feature ${selectedFeature.id}`,
          });*/
        },
        onError: (/*error*/) => {
          setIsModalOpen(false);
          /*notification.success({
            description: `There was an error importing your asset for feature ${selectedFeature.id}. Error: ${error}`,
          });*/
        },
      });
    }
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
