import React from 'react';
import styles from './ManageMapProjectPanel.module.css';
import { Project } from '@hazmapper/types';

interface ManageMapProjectModalProps {
  project: Project;
}

const ManageMapProjectPanel: React.FC<ManageMapProjectModalProps> = ({
  project,
}) => {
  return (
    <div className={styles.root}>
      Manage Map Project TODO, isPublicView: {project.id}
    </div>
  );
};

export default ManageMapProjectPanel;
