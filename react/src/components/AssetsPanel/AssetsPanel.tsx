import React, { useState, useEffect } from 'react';
import styles from './AssetsPanel.module.css';
import FeatureFileTree from '@hazmapper/components/FeatureFileTree';
import { FeatureCollection, Project } from '@hazmapper/types';
import { Button } from '@tacc/core-components';
import { useFeatures } from '@hazmapper/hooks';
import {
  socket,
  setupSocketListeners,
  removeSocketListeners,
} from '../../utils/socketUtils';
import { ToastContainer } from 'react-toastify';

const getFilename = (projectName: string) => {
  // Convert to lowercase filename based on projectName
  const sanitizedString = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${sanitizedString}.json`;
};

interface DownloadFeaturesButtonProps {
  project: Project;
}

const DownloadFeaturesButton: React.FC<DownloadFeaturesButtonProps> = ({
  project,
}) => {
  const { isLoading: isDownloading, refetch: triggerDownload } = useFeatures({
    projectId: project.id,
    isPublicView: project.public,
    assetTypes: [], // Empty array to get all features
    options: {
      enabled: false, // Only fetch when triggered by user clicking button
      cacheTime: 0,
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
    <Button isLoading={isDownloading} onClick={() => triggerDownload()}>
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
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  const triggerSuccess = () => {
    socket.emit('trigger_asset_success', {
      message: 'Hello from the client!',
    });
  };

  const triggerFailure = () => {
    socket.emit('trigger_asset_failure', {
      message: 'Hello from the client!',
    });
  };

  useEffect(() => {
    setupSocketListeners(setConnectionStatus);
    return () => {
      removeSocketListeners();
    };
  }, []);
  return (
    <div className={styles.root}>
      <div className={styles.topSection}>
        <>
          <Button size="small" onClick={triggerSuccess}>
            Asset Success
          </Button>
          <Button size="small" onClick={triggerFailure}>
            Asset Failure
          </Button>
          <ToastContainer />
          <div className={styles.root}>
            <Button>Import from DesignSafe TODO/WG-387</Button>
            Assets Panel TODO, isPublicView: {isPublicView}
          </div>
          Connection Status: {connectionStatus}
        </>
      </div>
      <div className={styles.middleSection}>
        <FeatureFileTree
          projectId={project.id}
          isPublicView={isPublicView}
          featureCollection={featureCollection}
        />
      </div>
      <div className={styles.bottomSection}>
        <DownloadFeaturesButton project={project} />
      </div>
    </div>
  );
};

export default AssetsPanel;
