import React, { useState } from 'react';
import styles from './AssetsPanel.module.css';
import FeatureFileTree from '@hazmapper/components/FeatureFileTree';
import { FeatureCollection, Project, TapisFilePath } from '@hazmapper/types';
import { Flex, Layout, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  useFeatures,
  useImportFeature,
  useNotification,
} from '@hazmapper/hooks';
import { IMPORTABLE_FEATURE_TYPES } from '@hazmapper/utils/fileUtils';
import FileBrowserModal from '../FileBrowserModal/FileBrowserModal';

const getFilename = (projectName: string) => {
  // Convert to lowercase filename based on projectName
  const sanitizedString = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${sanitizedString}.json`;
};

interface DownloadFeaturesButtonProps {
  project: Project;
  isPublicView: boolean;
  disabled: boolean;
}

const DownloadFeaturesButton: React.FC<DownloadFeaturesButtonProps> = ({
  project,
  isPublicView,
  disabled,
}) => {
  const { isLoading: isDownloading, refetch } = useFeatures({
    projectId: project.id,
    isPublicView: isPublicView,
    assetTypes: [], // Empty array to get all features
    options: {
      enabled: false, // Only fetch when triggered by user clicking button
      gcTime: 0,
      staleTime: 0,
    },
  });

  const triggerDownload = () => {
    refetch().then(({ data }) => {
      if (data) {
        // Create and trigger download
        const blob = new Blob([JSON.stringify(data)], {
          type: 'application/json',
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = getFilename(project.name);

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <Button
      loading={isDownloading}
      onClick={() => triggerDownload()}
      type="primary"
      disabled={disabled}
    >
      Export to GeoJSON
    </Button>
  );
};

interface Props {
  /**
   * Features of map
   */
  featureCollection: FeatureCollection;

  /**
   * Whether or not the map project is a public view.
   */
  isPublicView: boolean;

  /**
   * active project
   */
  project: Project;
}

/**
 * A panel component that displays info on feature assets
 */
const AssetsPanel: React.FC<Props> = ({
  isPublicView,
  featureCollection,
  project,
}) => {
  const notification = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: importFeatureFiles } = useImportFeature(project.id);

  const handleFileImport = (files: TapisFilePath[]) => {
    importFeatureFiles(
      { files },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          notification.success({
            description: 'Import started!',
          });
        },
        onError: () => {
          notification.error({
            description: 'Import failed! Try again?',
          });
        },
      }
    );
  };

  const { Content, Header, Footer } = Layout;

  return (
    <>
      <Flex vertical className={styles.root}>
        {!isPublicView && (
          <Header className={styles.topSection}>
            <Button
              onClick={() => setIsModalOpen(true)}
              icon={<PlusOutlined />}
            >
              Import from DesignSafe
            </Button>
          </Header>
        )}
        <Content className={styles.middleSection}>
          <FeatureFileTree
            projectId={project.id}
            isPublicView={isPublicView}
            featureCollection={featureCollection}
          />
        </Content>
        <Footer className={styles.bottomSection}>
          <DownloadFeaturesButton
            project={project}
            isPublicView={isPublicView}
            disabled={featureCollection?.features.length === 0}
          />
        </Footer>
      </Flex>
      <FileBrowserModal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(false)}
        onImported={handleFileImport}
        allowedFileExtensions={IMPORTABLE_FEATURE_TYPES}
      />
    </>
  );
};

export default AssetsPanel;
