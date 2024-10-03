import React, { useState } from 'react';
import { useProjectsWithDesignSafeInformation } from '../../hooks';
import { Button, LoadingSpinner, Icon } from '../../core-components';
import styles from './ProjectListing.module.css';
import { EmptyTablePlaceholder } from '../utils';
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
  }

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
                  <Icon name="add" />
                  Create a New Map
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {isError && (
              <tr>
                <td colSpan={3}>
                  <EmptyTablePlaceholder type="error">
                    There was an error gathering your maps and projects. {''}
                    <a
                      href="https://www.designsafe-ci.org/help/new-ticket/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Click here to submit a ticket on DesignSafe.
                    </a>
                  </EmptyTablePlaceholder>
                </td>
              </tr>
            )}
            {data && data.length > 0 ? (
              data?.map((proj) => (
                <tr key={proj.id} onClick={() => navigateToProject(proj.uuid)}>
                  <td className={styles.projectName}>{proj.name}</td>
                  <td>
                    {proj.ds_project?.value.projectId}
                    {' - '}
                    {proj.ds_project?.value.title}
                  </td>
                  <td>
                    <Button
                      type="link"
                      className={styles.projectListItemButton}
                    >
                      <Icon name="edit-document" />
                    </Button>
                    <Button
                      type="link"
                      className={styles.projectListItemButton}
                    >
                      <Icon name="trash" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>
                  <EmptyTablePlaceholder type="info">
                    No projects or maps found.
                    <br />
                    Click Create New Map above to get started.
                  </EmptyTablePlaceholder>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectListing;
