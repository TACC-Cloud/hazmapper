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

  const { data, isLoading, isError, error } =
    useProjectsWithDesignSafeInformation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className={styles.root}>
          <EmptyTablePlaceholder type="error">
            There was an error gathering your maps.{' '}
            {/* @ts-ignore: Suppress error typing issues */}
            {error?.message ? error?.message : 'An unknown error occurred.'}
            <br />
            <a
              href="https://www.designsafe-ci.org/help/new-ticket/"
              target="_blank"
              rel="noreferrer"
            >
              Click here to submit a ticket on DesignSafe.
            </a>
          </EmptyTablePlaceholder>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {data && data.length > 0 ? (
        <table className={styles.projectList} >
          <thead >
            <tr>
              <th>Map</th>
              <th>Project</th>
              <th className={styles.buttonColumn}>
                <CreateMapModal isOpen={isModalOpen} toggle={toggleModal} />
                <Button
                  onClick={toggleModal}
                  type="link"
                  iconNameBefore="add"
                >
                  Create a New Map
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.map((proj) => (
              <tr key={proj.id} onClick={() => navigateToProject(proj.uuid)}>
                <td>{proj.name}</td>
                <td>
                  {proj.ds_project?.value.projectId}
                  {' - '}
                  {proj.ds_project?.value.title}
                </td>
                <td className={styles.buttonColumn}>
                  <Button type="link" iconNameBefore="edit-document"></Button>
                  <Button type="link" iconNameBefore="trash"></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <EmptyTablePlaceholder type="info">
          No maps found.
          <br />
          Click Create New Map above to get started.
        </EmptyTablePlaceholder>
      )}
    </div>
  );
};

export default ProjectListing;
