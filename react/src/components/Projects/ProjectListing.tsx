import React, { useState } from 'react';
import { useProjectsWithDesignSafeInformation } from '@hazmapper/hooks';
import { Button, LoadingSpinner } from '@tacc/core-components';
import CreateMapModal from '../CreateMapModal/CreateMapModal';
import DeleteMapModal from '../DeleteMapModal/DeleteMapModal';
import { Project } from '../../types';
import { useNavigate } from 'react-router-dom';

export const ProjectListing: React.FC = () => {
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

  const { data, isLoading, isError } = useProjectsWithDesignSafeInformation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <h4>Unable to retrieve projects</h4>;
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Map</th>
            <th>Project</th>
            <th>
              <CreateMapModal isOpen={isModalOpen} toggle={toggleModal} />
              <Button onClick={toggleModal} size="small">
                Create a New Map
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {data?.map((proj) => (
            <tr key={proj.id}>
              <td key={proj.id}>
                {' '}
                <Button
                  type="link"
                  onClick={() => navigateToProject(proj.uuid)}
                >
                  {proj.name}
                </Button>
              </td>
              <td key={proj.id}>
                {' '}
                <Button
                  type="link"
                  onClick={() => navigateToProject(proj.uuid)}
                >
                  {proj.ds_project
                    ? `${proj.ds_project?.value.projectId} |
                ${proj.ds_project?.value.title}`
                    : '---------'}
                </Button>
              </td>
              <td>
                <Button iconNameBefore="edit-document"></Button>
                <Button
                  iconNameBefore="trash"
                  onClick={() => setSelectedProjectForDeletion(proj)}
                ></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedProjectForDeletion && (
        <DeleteMapModal
          isOpen={!!selectedProjectForDeletion}
          close={() => setSelectedProjectForDeletion(null)}
          project={selectedProjectForDeletion}
        />
      )}
    </>
  );
};
