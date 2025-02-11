import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Button, SectionMessage } from '@tacc/core-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { Project } from '../../types';
import { useDeleteProject } from '../../hooks/projects/';

type DeleteMapModalProps = {
  isOpen: boolean;
  close: () => void;
  project: Project;
};

const DeleteMapModal = ({
  isOpen,
  close: parentToggle,
  project,
}: DeleteMapModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    mutate: deleteProject,
    isPending: isDeletingProject,
    isError,
    isSuccess,
  } = useDeleteProject();

  const handleClose = () => {
    parentToggle();
  };

  const handleDeleteProject = () => {
    deleteProject(
      { projectId: project.id },
      {
        onSuccess: () => {
          parentToggle();
          if (location.pathname.includes(`/project/${project.uuid}`)) {
            // If on project page, navigate home with success state
            navigate('/', {
              replace: true,
              state: { onSuccess: true },
            });
          } else {
            // If not on project page, just navigate to current location with success state
            navigate(location, {
              replace: true,
              state: { onSuccess: true },
            });
          }
        },
      }
    );
  };

  return (
    <Modal size="lg" isOpen={isOpen} toggle={handleClose}>
      <ModalHeader toggle={handleClose}>
        Delete Map: {project?.name}{' '}
      </ModalHeader>
      <ModalBody>
        {project?.deletable ? (
          <>
            Are you sure you want to delete this map? All associated features,
            metadata, and saved files will be deleted.
            {project?.public && <b> Note that this is a public map. </b>}
            <br />
            <b>
              <u>This cannot be undone.</u>
            </b>
          </>
        ) : (
          'You don’t have permission to delete this map.'
        )}
      </ModalBody>
      <ModalFooter className="justify-content-start">
        <Button size="short" type="secondary" onClick={handleClose}>
          {isSuccess ? 'Close' : 'Cancel'}
        </Button>
        <Button
          size="short"
          type="primary"
          attr="submit"
          isLoading={isDeletingProject}
          onClick={handleDeleteProject}
          disabled={isSuccess || !project?.deletable}
        >
          Delete
        </Button>
        {isError && (
          <SectionMessage type="error">
            {'There was an error deleting your map.'}
          </SectionMessage>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default DeleteMapModal;
