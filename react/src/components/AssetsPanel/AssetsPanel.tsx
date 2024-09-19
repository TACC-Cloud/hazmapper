import React, { useEffect } from 'react';
import styles from './AssetsPanel.module.css';
import FeatureFileTree from './FeatureFileTree';

interface Props {
  /**
   * Whether or not the map project is public.
   */
  isPublic: boolean;
}

/**
 * A panel component that displays info on feature assets
 */
const AssetsPanel: React.FC<Props> = ({ isPublic }) => {
  return (
    <div className={styles.root}>
      <div className={styles.topSection}>
        Add Feature TODO, isPublic: {isPublic}
      </div>
      <div className={styles.middleSection}>
        <FeatureFileTree/>
      </div>
      <div className={styles.bottomSection}>Export json TODO</div>
    </div>
  );
};

export default AssetsPanel;
