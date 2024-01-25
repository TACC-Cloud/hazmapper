import React, { useState, useRef } from 'react';
import {
  LoadingSpinner,
  InlineMessage,
  SectionHeader,
  Button,
} from '../../core-components';
import { useProjects } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types';
import CreateMapModal from '../../components/CreateMapModal/CreateMapModal';
import useCreateProject from '../../hooks/projects/useCreateProject';

function MainMenu() {
  const { data, isLoading, error } = useProjects();
  const { mutate: createProject, isLoading: isCreatingProject } =
    useCreateProject();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createMapModalRef = useRef<{
    setErrorMessage: (message: string) => void;
  }>(null);

  const toggleModal = () => {
    if (createMapModalRef.current) {
      createMapModalRef.current.setErrorMessage('');
    }
    setIsModalOpen(!isModalOpen);
  };

  const navigate = useNavigate();

  const handleCreateProject = (projectData) => {
    createProject(projectData, {
      onSuccess: (newProject: Project) => {
        // TO-ADD: Handle success (e.g., show success message, refetch projects, etc.)
        navigate(`/project/${newProject.uuid}`);
      },
      onError: (err) => {
        // Handle error (e.g., show error message)
        console.error('Error creating project:', err);
        let errorMessage = 'An error occurred while creating the project.';
        if (err?.response?.status === 409) {
          errorMessage = 'That folder is already syncing with a different map.';
        } else if (err?.response?.status === 500) {
          errorMessage = 'Internal server error. Please contact support.';
        } else {
          errorMessage = 'Something went wrong. Please contact support.';
        }
        createMapModalRef.current?.setErrorMessage(errorMessage);
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
        type="primary"
        size="small"
        onClick={toggleModal}
        disabled={isCreatingProject}
      >
        Create Map
      </Button>
      <CreateMapModal
        ref={createMapModalRef}
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
