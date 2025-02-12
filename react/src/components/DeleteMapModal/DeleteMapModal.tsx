import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Button, SectionMessage } from '@tacc/core-components';
import { useNavigate } from 'react-router-dom';
import { Project } from '@hazmapper/types';
import { useDeleteProject } from '@hazmapper/hooks/projects/';
import { useNotification } from '@hazmapper/hooks';
import * as ROUTES from '@hazmapper/constants/routes';

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
  const notification = useNotification();
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
          navigate(ROUTES.MAIN);
          notification.success({
            message: 'Success',
            description: 'Your map was successfully deleted.',
            placement: 'bottomLeft',
          });
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
