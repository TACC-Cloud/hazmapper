import React, { useState } from 'react';
import { useProjectsWithDesignSafeInformation } from '@hazmapper/hooks';
import { Button, LoadingSpinner, SectionMessage } from '@tacc/core-components';
import { EmptyTablePlaceholder } from '../utils';
import styles from './ProjectListing.module.css';
import CreateMapModal from '../CreateMapModal/CreateMapModal';
import DeleteMapModal from '../DeleteMapModal/DeleteMapModal';
import { Project } from '../../types';
import { useNavigate } from 'react-router-dom';

const ProjectListing: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectForDeletion, setSelectedProjectForDeletion] =
    useState<Project | null>(null);
  const navigate = useNavigate();

  const navigateToProject = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const { data, isLoading, isError, error } =
    useProjectsWithDesignSafeInformation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className={styles.root}>
        <div className={styles.errorMessage}>
          <SectionMessage type="error">
            There was an error gathering your maps.{' '}
            {error?.message ? error?.message : 'An unknown error occurred.'}
            <br />
            <a
              href="https://www.designsafe-ci.org/help/new-ticket/"
              target="_blank"
              rel="noreferrer"
            >
              Click here to submit a ticket to DesignSafe.
            </a>
          </SectionMessage>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.versionContainer}>
        <img
          src="./src/assets/Hazmapper-Stack@4x.png"
          alt="Hazmapper Logo Version 2.17"
        ></img>
        <div className={styles.version}>{'Version 2.17'}</div>
      </div>
      <div className={styles.projectList}>
        <table>
          <thead>
            <tr>
              <th className={styles.mapColumn}>Map</th>
              <th className={styles.projectColumn}>Project</th>
              <th className={styles.buttonColumn}>
                <CreateMapModal isOpen={isModalOpen} toggle={toggleModal} />
                <Button onClick={toggleModal} type="link" iconNameBefore="add">
                  Create a New Map
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {data && data?.length > 0 ? (
              data.map((proj) => (
                <tr key={proj.id} onClick={() => navigateToProject(proj.uuid)}>
                  <td className={styles.mapColumn}>{proj.name}</td>
                  <td className={styles.projectColumn}>
                    {proj.ds_project
                      ? `${proj.ds_project?.value.projectId} |
                ${proj.ds_project?.value.title}`
                      : '---------'}
                  </td>
                  <td className={styles.buttonColumn}>
                    <Button type="link" iconNameBefore="edit-document"></Button>
                    <Button
                      type="link"
                      iconNameBefore="trash"
                      onClick={() => setSelectedProjectForDeletion(proj)}
                    ></Button>
                  </td>
                </tr>
              ))
            ) : (
              <td colSpan={3}>
                <EmptyTablePlaceholder type="info">
                  No maps found.
                  <br />
                  <Button type="link" onClick={toggleModal}>
                    Create New Map
                  </Button>{' '}
                  to get started.
                </EmptyTablePlaceholder>
              </td>
            )}
          </tbody>
        </table>
      </div>
      <Button
        className={styles.userGuide}
        iconNameBefore="exit"
        type="link"
        onClick={(e) => {
          window.open(
            'https://www.designsafe-ci.org/user-guide/tools/visualization/#hazmapper-user-guide',
            '_blank',
            'noopener,noreferrer'
          );
          // To prevent active box around link lingering after click
          e.currentTarget.blur();
        }}
      >
        User Guide
      </Button>
      {selectedProjectForDeletion && (
        <DeleteMapModal
          isOpen={!!selectedProjectForDeletion}
          close={() => setSelectedProjectForDeletion(null)}
          project={selectedProjectForDeletion}
        />
      )}
    </div>
  );
};

export default ProjectListing;
