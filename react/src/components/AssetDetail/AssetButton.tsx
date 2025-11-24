import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Button } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { Feature, FeatureType } from '@hazmapper/types';
import {
  getFeatureType,
  IFileImportRequest,
  TapisFilePath,
} from '@hazmapper/types';
import {
  useImportFeatureAsset,
  useNotification,
  useAppConfiguration,
} from '@hazmapper/hooks';
import FileBrowserModal from '../FileBrowserModal/FileBrowserModal';
import { IMPORTABLE_FEATURE_ASSET_TYPES } from '@hazmapper/utils/fileUtils';
import { buildDesignSafeLink } from '@hazmapper/utils/designsafe';

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
  const { designsafePortalUrl } = useAppConfiguration();
  const pointCloudURL = DOMPurify.sanitize(featureSource + '/index.html');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const featureType = getFeatureType(selectedFeature);
  const projectId = selectedFeature.project_id;
  const notification = useNotification();
  const featureId = selectedFeature.id;
  const {
    mutate: importFeatureAsset,
    isPending: isImporting,
    isSuccess,
    reset,
  } = useImportFeatureAsset(projectId, featureId);

  useEffect(() => {
    reset();
  }, [selectedFeature.id, reset]);

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
          notification.error({
            description: `There was an error importing your asset for feature ${selectedFeature.id}. Error: ${error}`,
          });
        },
      });
    }
  };

  const asset = selectedFeature?.assets?.[0];
  const canShowDesignSafeLink = (() => {
    if (!asset?.current_system || !asset?.current_path) return false;
    if (isPublicView && !asset.is_on_public_system) return false;
    return true;
  })();

  const designSafeLink = canShowDesignSafeLink
    ? buildDesignSafeLink(
        asset.current_system || asset.original_system,
        asset.current_path || asset.original_path,
        asset.designsafe_project_id,
        designsafePortalUrl
      )
    : null;

  return (
    <>
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
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          loading={isImporting}
          disabled={isImporting || isSuccess}
        >
          Add Asset from DesignSafe
        </Button>
      )}

      {designSafeLink?.url && (
        <Button
          type="primary"
          icon={<ExportOutlined />}
          href={designSafeLink.url}
          target="_blank"
          rel="noreferrer"
        >
          Open in DesignSafe
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
