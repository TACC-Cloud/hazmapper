import React from 'react';
import styles from './ManageMapProjectPanel.module.css';
import { Button } from 'reactstrap';

interface ManageMapProjectPanelProps {
  /**
   * Whether or not the map project is public.
   */
  isPublic: boolean;
}

/**
 * A component that displays a panel for managing the map project.
 */
const ManageMapProjectPanel: React.FC<ManageMapProjectPanelProps> = ({ isPublic }) => {
  // Testing panel behavior. Seeing the panel element displace the map as opposed to overlay.
  return (
    <div className={styles.root}>
      <h1>Map Management Panel</h1>
      <h2 className={`${styles['add-margin-bottom']}`}>Map Project Information</h2>
      <div className={`${styles['add-margin-bottom']}`}>Name: TBD</div>
      <div className={`${styles['add-margin-bottom']}`}>Description: TBD</div>
      <div className={`${styles['add-margin-bottom']}`}>Saved Location: TBD</div>

      <h2 className={`${styles['add-margin-bottom']}`}>Map Project Members</h2>
      <ul>
        <li>TBD</li>
      </ul>

      <h2 className={`${styles['add-margin-bottom']}`}>Public Access</h2>
      <div className={`${styles['add-margin-bottom']}`}>Is-Public: {isPublic}</div>
      <Button
        style={{ width: '12rem' }}
        className={`${styles['add-margin-bottom']}`}
        color="success"
        size="md"
      >
        Make Map Public
      </Button>
      <Button
        style={{ width: '12rem' }}
        className={`${styles['add-margin-bottom']}`}
        color="danger"
        size="md"
      >
        Delete Map
      </Button>
    </div>
  );
};

export default ManageMapProjectPanel;
