import React, { useState } from 'react';
import { Project, DesignSafeProject } from '../../types';
import {
  useDsProjects,
  useProjects,
  mergeDesignSafeProject,
} from '../../hooks';
import { Button, LoadingSpinner } from '@tacc/core-components';
import CreateMapModal from '../CreateMapModal/CreateMapModal';

export const ProjectListing: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const { data, isLoading, isError } = useProjects();
  let projectsData: Array<Project> = [];
  let dsData: Array<DesignSafeProject> = [];
  const resp = useDsProjects();
  dsData = resp?.data?.projects ?? [];
  projectsData = data ?? [];

  const combinedProj = mergeDesignSafeProject(projectsData, dsData);
  projectsData = combinedProj;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <h4>Unable to retrieve projects</h4>;
  }

  return (
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
        {projectsData?.map((proj) => (
          <tr key={proj.id}>
            <td>{proj.name}</td>
            <td>
              {proj.ds_project_id} {proj.ds_project_title}
            </td>
            <td></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
