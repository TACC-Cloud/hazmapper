import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Button, SectionMessage } from '@tacc/core-components';
import styles from './DeleteMapModal.module.css';
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
  const {
    mutate: deleteProject,
    isLoading: isDeletingProject,
    isError,
    isSuccess,
  } = useDeleteProject(project.id);
  const handleClose = () => {
    parentToggle();
  };

  const handleDeleteProject = () => {
    deleteProject(undefined, {});
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
          "This map cannot be deleted because you don't have correct permission credentials."
        )}
      </ModalBody>
      <ModalFooter className="justify-content-start">
        <Button size="short" type="secondary" onClick={handleClose}>
          {isSuccess ? 'Close' : 'Cancel'}
        </Button>
        {project?.deletable ? (
          <Button
            size="short"
            type="primary"
            attr="submit"
            isLoading={isDeletingProject}
            onClick={handleDeleteProject}
            disabled={isSuccess}
          >
            Delete
          </Button>
        ) : (
          <Button size="short" type="primary" attr="submit" disabled>
            Delete
          </Button>
        )}
        {isSuccess && (
          <SectionMessage type="success">
            {'Succesfully deleted the map.'}
          </SectionMessage>
        )}
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
