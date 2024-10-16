import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Button, SectionMessage } from '../../core-components';
import styles from './DeleteMapModal.module.css';
import { Project } from '../../types';
import { useDeleteProject } from '../../hooks/projects/';

type DeleteMapModalProps = {
  isOpen: boolean;
  toggle: () => void;
  projectId?: number;
  project?: Project;
};

const DeleteMapModal = ({
  isOpen,
  toggle: parentToggle,
  projectId,
  project,
}: DeleteMapModalProps) => {
  const [errorMessage, setErrorMessage] = useState('');
  const { mutate: deleteProject, isLoading: isDeletingProject } =
    useDeleteProject(projectId);
  const handleClose = () => {
    setErrorMessage(''); // Clear the error message
    parentToggle(); // Call the original toggle function passed as a prop
  };

  const handleDeleteProject = () => {
    deleteProject(undefined, {
      onSuccess: () => {
        handleClose();
      },
      onError: () => {
        setErrorMessage('There was an error deleting your project.');
      },
    });
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} className={styles.root}>
      <ModalHeader toggle={handleClose}>
        Delete Map: {project?.name}{' '}
      </ModalHeader>
      <ModalBody>
        {project?.deletable
          ? 'Are you sure you want to delete this map? All associated features, metadata, and saved files will be deleted. THIS CANNOT BE UNDONE.'
          : "This map is not able to be deleted either because the map is public or because you don't have permission."}
      </ModalBody>
      <ModalFooter className="justify-content-start">
        <Button size="short" type="secondary" onClick={handleClose}>
          Cancel
        </Button>
        {project?.deletable ? (
          <Button
            size="short"
            type="primary"
            attr="submit"
            isLoading={isDeletingProject}
            onClick={handleDeleteProject}
          >
            Delete
          </Button>
        ) : (
          <Button size="short" type="primary" attr="submit" disabled>
            Delete
          </Button>
        )}
        {errorMessage && (
          <SectionMessage type="error">{errorMessage}</SectionMessage>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default DeleteMapModal;
