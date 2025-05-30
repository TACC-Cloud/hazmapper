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

  const { data, isLoading, isError, error } =
    useProjectsWithDesignSafeInformation();

  if (isLoading) {
    return (
      <div className={styles.root}>
        <LoadingSpinner />
      </div>
    );
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
      <div className={styles.projectList}>
        <table>
          <thead>
            <tr>
              <th className={styles.mapColumn}>Map</th>
              <th className={styles.projectColumn}>Project</th>
              <th className={styles.buttonColumn}>
                <CreateMapModal
                  isOpen={isModalOpen}
                  closeModal={() => setIsModalOpen(false)}
                />
                <Button
                  onClick={() => setIsModalOpen(true)}
                  type="link"
                  iconNameBefore="add"
                >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectForDeletion(proj);
                      }}
                      disabled={!proj.deletable}
                    ></Button>
                  </td>
                </tr>
              ))
            ) : (
              <td colSpan={3}>
                <EmptyTablePlaceholder type="info">
                  No maps found.
                  <br />
                  <Button type="link" onClick={() => setIsModalOpen(true)}>
                    Create New Map
                  </Button>{' '}
                  to get started.
                </EmptyTablePlaceholder>
              </td>
            )}
          </tbody>
        </table>
      </div>
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
