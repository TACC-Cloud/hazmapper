import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  LoadingSpinner,
  InlineMessage,
  SectionHeader,
} from '../../core-components';
import { useProjects } from '../../hooks';
import MapModal from '../../components/MapModal';
import { Button } from 'reactstrap';
import useCreateProject from '../../hooks/projects/useCreateProject';

function MainMenu() {
  const { data, isLoading, error } = useProjects();
  const { mutate: createProject, isLoading: isCreatingProject } =
    useCreateProject();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleCreateProject = (projectData) => {
    createProject(projectData, {
      onSuccess: () => {
        // TO-ADD: Handle success (e.g., show success message, refetch projects, etc.)
        console.log('Data after submit', projectData);
        toggleModal();
      },
      onError: (err) => {
        // Handle error (e.g., show error message)
        console.error('Error creating project:', err);
      },
    });
  };

  if (isLoading) {
    return (
      <>
        <SectionHeader isNestedHeader>Main Menu</SectionHeader>
        <LoadingSpinner />
      </>
    );
  }
  if (error) {
    return (
      <>
        <SectionHeader isNestedHeader>Main Menu</SectionHeader>
        <InlineMessage type="error">Unable to retrieve projects.</InlineMessage>
      </>
    );
  }
  return (
    <>
      <SectionHeader isNestedHeader>Main Menu</SectionHeader>
      <Button
        color="primary"
        onClick={toggleModal}
        disabled={isCreatingProject}
      >
        Create Map
      </Button>
      <MapModal
        isOpen={isModalOpen}
        toggle={toggleModal}
        onSubmit={handleCreateProject}
        isCreating={isCreatingProject}
      />

      <table>
        <thead>Projects</thead>
        <tbody>You have {data?.length} projects.</tbody>
      </table>
    </>
  );
}

export default MainMenu;
