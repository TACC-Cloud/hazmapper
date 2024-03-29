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
  const handleClose = () => {
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
    const projectData: ProjectRequest = {
      name: values.name,
      description: values.description,
      system_file: values.system_file,
      system_id: values.system_id,
      system_path: `/${userData.username}`,
      watch_content: values.syncFolder,
      watch_users: values.syncFolder,
    };
    handleCreateProject(projectData);
  };
  return (
    <Modal isOpen={isOpen} toggle={handleClose}>
      <ModalHeader toggle={handleClose}>Create a New Map</ModalHeader>
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
          {({ errors, touched }) => (
            <Form className="c-form">
              <FieldWrapperFormik name="map-form-info" label="">
                <FormikInput
                  name="name"
                  label="Name"
                  required
                  data-testid="name-input"
                />
                <FormikTextarea
                  name="description"
                  label="Description"
                  required
                />
                <div className={`${styles['field-wrapper']}`}>
                  <FormikInput
                    name="system_file"
                    label="Custom File Name"
                    required
                    className={`${styles['input-custom-size']}`}
                  />
                  <span
                    className={`${styles['hazmapper-suffix']} ${
                      errors.system_file && touched.system_file
                        ? styles['hazmapper-suffix--error']
                        : styles['hazmapper-suffix--normal']
                    }`}
                  >
                    .hazmapper
                  </span>
                </div>
                <div className={`${styles['field-wrapper-alt']}`}>
                  <FormikInput
                    name="save-location-label"
                    label="Save Location"
                    value={`/${userData?.username}`}
                    readOnly
                    disabled
                  />
                </div>
                <FormikCheck
                  name="syncFolder"
                  label="Sync Folder"
                  description="When enabled, files in this folder are automatically synced
                  into the map periodically."
                />
              </FieldWrapperFormik>
              {errorMessage && (
                <div className="c-form__errors">{errorMessage}</div>
              )}
              <ModalFooter className="justify-content-start">
                <Button size="short" type="secondary" onClick={handleClose}>
                  Close
                </Button>
                <Button
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
