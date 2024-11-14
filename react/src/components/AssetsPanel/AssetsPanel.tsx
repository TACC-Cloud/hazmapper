import React from 'react';
import styles from './AssetsPanel.module.css';
import FeatureFileTree from '@hazmapper/components/FeatureFileTree';
import { FeatureCollection } from '@hazmapper/types';
import { Button } from '@tacc/core-components';
import { useFeatures } from '@hazmapper/hooks';

interface DownloadFeaturesButtonProps {
  projectId: number;
  isPublic: boolean;
}

const DownloadFeaturesButton: React.FC<DownloadFeaturesButtonProps> = ({
  projectId,
  isPublic,
}) => {
  const { isLoading: isDownloading, refetch: triggerDownload } = useFeatures({
    projectId,
    isPublic,
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
        link.download = `hazmapper.json`;

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
   * Whether or not the map project is public.
   */
  isPublic: boolean;

  /**
   * active project id
   */
  projectId: number;
}

/**
 * A panel component that displays info on feature assets
 */
const AssetsPanel: React.FC<Props> = ({
  isPublic,
  featureCollection,
  projectId,
}) => {
  return (
    <div className={styles.root}>
      <div className={styles.topSection}>
        <Button>Import from DesignSafe TODO/WG-387</Button>
      </div>
      <div className={styles.middleSection}>
        <FeatureFileTree
          projectId={projectId}
          isPublic={isPublic}
          featureCollection={featureCollection}
        />
      </div>
      <div className={styles.bottomSection}>
        <DownloadFeaturesButton projectId={projectId} isPublic={isPublic} />
      </div>
    </div>
  );
};

export default AssetsPanel;
