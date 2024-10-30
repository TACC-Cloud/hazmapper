import React, { useState } from 'react';
import { useProjectsWithDesignSafeInformation } from '@hazmapper/hooks';
import { Button, LoadingSpinner, SectionMessage } from '@tacc/core-components';
import { EmptyTablePlaceholder } from '../utils';
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
          {/*@ts-ignore: Suppress error typing issues*/}
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
      <table className={styles.projectList}>
        <thead>
          <tr>
            <th>Map</th>
            <th>Project</th>
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
                <td>{proj.name}</td>
                <td>
                {proj.ds_project
                    ? `${proj.ds_project?.value.projectId} |
                ${proj.ds_project?.value.title}`
                    : '---------'}
                </td>
                <td className={styles.buttonColumn}>
                  <Button type="link" iconNameBefore="edit-document"></Button>
                  <Button type="link" iconNameBefore="trash"></Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
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
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectListing;
