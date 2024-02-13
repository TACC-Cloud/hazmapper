import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Button } from '../../core-components';
import styles from './CreateMapModal.module.css';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import useCreateProject from '../../hooks/projects/useCreateProject';
import useAuthenticatedUser from '../../hooks/user/useAuthenticatedUser';
import { useNavigate } from 'react-router-dom';
import { ProjectRequest } from '../../types';
import {
  FieldWrapperFormik,
  FormikInput,
  FormikTextarea,
  FormikCheck,
} from '../../core-wrappers';

type CreateMapModalProps = {
  isOpen: boolean;
  toggle: () => void;
};

// Yup validation schema
const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),
  system_file: Yup.string()
    .matches(
      /^[A-Za-z0-9-_]+$/,
      'Only letters, numbers, hyphens, and underscores are allowed'
    )
    .required(' File name is required'),
});

const CreateMapModal = ({
  isOpen,
  toggle: parentToggle,
}: CreateMapModalProps) => {
  const [errorMessage, setErrorMessage] = useState('');
  const { data: userData } = useAuthenticatedUser();
  const { mutate: createProject, isLoading: isCreatingProject } =
    useCreateProject();
  const navigate = useNavigate();
  const handleToggle = () => {
    setErrorMessage(''); // Clear the error message
    parentToggle(); // Call the original toggle function passed as a prop
  };

  const handleCreateProject = (projectData: ProjectRequest) => {
    createProject(projectData, {
      onSuccess: (newProject) => {
        navigate(`/project/${newProject.uuid}`);
      },
      onError: (err) => {
        // Handle error messages while creating new project
        if (err?.response?.status === 409) {
          setErrorMessage(
            'That folder is already syncing with a different map.'
          );
        } else {
          setErrorMessage(
            'An error occurred while creating the project. Please contact support.'
          );
        }
      },
    });
  };

  const handleSubmit = (values) => {
    if (!userData) {
      setErrorMessage('User information is not available');
      return;
    }
    const projectData = {
      observable: values.syncFolder,
      watch_content: values.syncFolder,
      project: {
        name: values.name,
        description: values.description,
        system_file: values.system_file,
        system_id: values.system_id,
        system_path: `/${userData.username}`,
      },
    };
    handleCreateProject(projectData);
  };
  return (
    <Modal isOpen={isOpen} toggle={handleToggle}>
      <ModalHeader toggle={handleToggle}>Create a New Map</ModalHeader>
      <ModalBody>
        <Formik
          initialValues={{
            name: '',
            description: '',
            system_file: '',
            system_id: 'designsafe.storage.default',
            system_path: '',
            syncFolder: false,
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form>
              <FieldWrapperFormik name="map-form-info" label="">
                <FormikInput
                  name="name"
                  label="Name"
                  required
                  data-testid="name-input"
                  className={`${styles['input-height']}`}
                />
                <FormikTextarea
                  name="description"
                  label="Description"
                  required
                  className={`${styles['input-height']}`}
                />
                <div className={`${styles['flexContainer']}`}>
                  <span>
                    <FormikInput
                      name="system_file"
                      label="Custom File Name"
                      required
                      className={`${styles['input-custom-size']}`}
                    />
                  </span>
                  <span className={`${styles['hazmapper-custom']}`}>
                    .hazmapper
                  </span>
                </div>
                <div className={`${styles['flexContainer-alt']}`}>
                  <label htmlFor="save-location-label">Save Location:</label>
                  <span className="text-primary">/{userData?.username}</span>
                </div>
                <div className={`${styles['flexContainer']}`}>
                  <label htmlFor="sync-folder-label">Sync Folder:</label>
                  <span className={`${styles['check-wrapper']}`}>
                    <FormikCheck name="syncFolder" label="" description="" />
                  </span>
                </div>
                <div className={`${styles['custom-sync-description']}`}>
                  When enabled, files in this folder are automatically synced
                  into the map periodically.
                </div>
              </FieldWrapperFormik>
              {errorMessage && (
                <div className={`${styles['custom-error-message']}`}>
                  {errorMessage}
                </div>
              )}
              <ModalFooter className="justify-content-start">
                <Button
                  className="justify-content-center"
                  size="short"
                  type="secondary"
                  onClick={handleToggle}
                >
                  Close
                </Button>
                <Button
                  className="justify-content-center"
                  size="short"
                  type="primary"
                  attr="submit"
                  isLoading={isCreatingProject}
                >
                  Create
                </Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalBody>
    </Modal>
  );
};

export default CreateMapModal;
