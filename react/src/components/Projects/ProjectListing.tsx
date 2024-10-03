import React, { useState } from 'react';
import { useProjectsWithDesignSafeInformation } from '../../hooks';
import { Button, LoadingSpinner, Icon } from '../../core-components';
import styles from './ProjectListing.module.css';
import CreateMapModal from '../CreateMapModal/CreateMapModal';
import { useNavigate } from 'react-router-dom';

const ProjectListing: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const navigateToProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const { data, isLoading, isError } = useProjectsWithDesignSafeInformation();

  if (isLoading) {
    return <LoadingSpinner />;
  };

  if (isError) {
    return <h4>Unable to retrieve projects</h4>;
  };

  return (
    <div className={styles.root}>
      <div className={styles.projectList}>
        <table>
          <thead className={styles.projectHeader}>
            <tr>
              <th className={styles.mapColumn}>Map</th>
              <th className={styles.projectColumn}>Project</th>
              <th className={styles.buttonColumn}>
                <CreateMapModal isOpen={isModalOpen} toggle={toggleModal} />
                <Button
                  onClick={toggleModal}
                  type="link"
                  className={styles.projectListItemButton}
                >
                  <Icon name="add"/>Create a New Map
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.map((proj) => (
              <tr  key={proj.id} onClick={() => navigateToProject(proj.uuid)}>
                <td className={styles.projectName}>{proj.name}</td>
                <td>
                  {proj.ds_project?.value.projectId}{' - '}
                  {proj.ds_project?.value.title}
                </td>
                <td >
                  <Button type="link" className={styles.projectListItemButton}>
                    <Icon name="edit-document"></Icon>
                  </Button>
                  <Button type="link" className={styles.projectListItemButton}>
                    <Icon name="trash"></Icon>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ProjectListing;
