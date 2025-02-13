import React, { useState } from 'react';
import styles from './AssetsPanel.module.css';
import FeatureFileTree from '@hazmapper/components/FeatureFileTree';
import { FeatureCollection, Project, TapisFilePath } from '@hazmapper/types';
import { Flex, Layout, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useFeatures, useImportFeature } from '@hazmapper/hooks';
import FileBrowserModal from '../FileBrowserModal/FileBrowserModal';

const getFilename = (projectName: string) => {
  // Convert to lowercase filename based on projectName
  const sanitizedString = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${sanitizedString}.json`;
};

interface DownloadFeaturesButtonProps {
  project: Project;
  isPublicView: boolean;
}

const DownloadFeaturesButton: React.FC<DownloadFeaturesButtonProps> = ({
  project,
  isPublicView,
}) => {
  const { isLoading: isDownloading, refetch: triggerDownload } = useFeatures({
    projectId: project.id,
    isPublicView: isPublicView,
    assetTypes: [], // Empty array to get all features
    options: {
      enabled: false, // Only fetch when triggered by user clicking button
      gcTime: 0,
      staleTime: 0,
      onSuccess: (data: FeatureCollection) => {
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
      },
    },
  });

  return (
    <Button
      loading={isDownloading}
      onClick={() => triggerDownload()}
      type="primary"
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: importFeatureFiles } = useImportFeature(project.id);

  const handleFileImport = (files: TapisFilePath[]) => {
    importFeatureFiles({ files });
    setIsModalOpen(false);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const allowedFileExtensions = [
    'shp',
    'jpg',
    'jpeg',
    'json',
    'geojson',
    'gpx',
    'rq',
    'png',
  ];

  const { Content, Header, Footer } = Layout;

  return (
    <>
      <Flex vertical className={styles.root} flex={1}>
        <Header className={styles.topSection}>
          <Button onClick={toggleModal} icon={<PlusOutlined />}>
            Import from DesignSafe
          </Button>
        </Header>
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
          />
        </Footer>
      </Flex>
      <FileBrowserModal
        isOpen={isModalOpen}
        toggle={toggleModal}
        onImported={handleFileImport}
        allowedFileExtensions={allowedFileExtensions}
      />
    </>
  );
};

export default AssetsPanel;
