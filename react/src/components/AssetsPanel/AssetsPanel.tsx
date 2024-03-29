import React from 'react';
import styles from './AssetsPanel.module.css';

interface Props {
  /**
   * Whether or not the map project is public.
   */
  isPublic: boolean;
}

/**
 * A component that displays a map project (a map and related data)
 */
const AssetsPanel: React.FC<Props> = ({ isPublic }) => {
  return (
    <div className={styles.root}>Assets Panel TODO, isPublic: {isPublic}</div>
  );
};

export default AssetsPanel;
