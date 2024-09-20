import React from 'react';
import styles from './AssetsPanel.module.css';
import FeatureFileTree from './FeatureFileTree';
import { FeatureCollection } from '../../types';

interface Props {
  /**
   * Features of map
   */
  featureCollection: FeatureCollection;

  /**
   * Whether or not the map project is public.
   */
  isPublic: boolean;
}

/**
 * A panel component that displays info on feature assets
 */
const AssetsPanel: React.FC<Props> = ({ isPublic, featureCollection }) => {
  return (
    <div className={styles.root}>
      <div className={styles.topSection}>
        Add Feature TODO, isPublic: {isPublic}
      </div>
      <div className={styles.middleSection}>
        <FeatureFileTree
          isPublic={isPublic}
          featureCollection={featureCollection}
        />
      </div>
      <div className={styles.bottomSection}>Export json TODO</div>
    </div>
  );
};

export default AssetsPanel;
