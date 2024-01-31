import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';
import { Button } from '../../core-components';
import styles from './CreateMapModal.module.css';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import useCreateProject from '../../hooks/projects/useCreateProject';
import useAuthenticatedUser from '../../hooks/user/useAuthenticatedUser';
import { useNavigate } from 'react-router-dom';

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
    .required('Custom file name is required'),
});

const CreateMapModal = ({ isOpen, toggle }: CreateMapModalProps) => {
  const [errorMessage, setErrorMessage] = useState('');
  const { data: userData } = useAuthenticatedUser();
  const { mutate: createProject, isLoading: isCreatingProject } =
    useCreateProject();
  const navigate = useNavigate();

  const handleCreateProject = (projectData, actions) => {
    createProject(projectData, {
      onSuccess: (newProject) => {
        navigate(`/project/${newProject.uuid}`);
      },
      onError: (err) => {
        // Handle error messages while creating new project
        setErrorMessage('An error occurred while creating the project.');
        if (err?.response?.status === 409) {
          setErrorMessage(
            'That folder is already syncing with a different map.'
          );
        } else if (err?.response?.status === 500) {
          setErrorMessage('Internal server error. Please contact support.');
        }
        actions.setSubmitting(false);
      },
    });
  };

  const handleSubmit = (values, actions) => {
    if (!userData) {
      setErrorMessage('User information is not available');
      actions.setSubmitting(false);
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
    handleCreateProject(projectData, actions);
  };
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Create a New Map</ModalHeader>
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
          {/*TODO-REACT: Will change to core-style's FormField comp instead of Formik's Form & Field comp*/}
          {({ errors, touched, values, handleChange }) => (
            <Form>
              <FormGroup>
                <Label for="name">Name</Label>
                <Field
                  name="name"
                  id="name"
                  className="col-sm-11"
                  data-testid="name-input"
                  as={Input}
                  invalid={touched.name && !!errors.name}
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="invalid-feedback"
                />
              </FormGroup>
              <FormGroup>
                <Label for="description">Description</Label>
                <Field
                  name="description"
                  id="description"
                  className="col-sm-11"
                  as={Input}
                  invalid={touched.description && !!errors.description}
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="invalid-feedback"
                />
              </FormGroup>
              <FormGroup>
                <Label for="system_file">Custom File Name</Label>
                <div className="input-group">
                  <Field
                    name="system_file"
                    id="system_file"
                    as={Input}
                    className="col-sm-8"
                    invalid={touched.system_file && !!errors.system_file}
                  />
                  <span className="input-group-text col-sm-3">.hazmapper</span>
                </div>
                {/* Alt solution to render error message bc input group was causing text to not display properly */}
                {touched.system_file && errors.system_file && (
                  <div className={`${styles['custom-error-message']}`}>
                    {errors.system_file}
                  </div>
                )}
              </FormGroup>
              {/* TODO-REACT: This part will change once the FileBrowser component is added*/}
              <FormGroup className="row align-items-center">
                <Label className="col-sm-4">Save Location:</Label>
                <div className="col-sm-8 text-primary">
                  {userData ? `/${userData.username}` : 'Loading...'}
                </div>
              </FormGroup>
              <FormGroup className="row mb-2">
                <Label className="col-sm-4 col-form-label pt-0">
                  Sync Folder:
                </Label>
                <div className="col-sm-8">
                  <div className="form-check">
                    <Field
                      type="checkbox"
                      name="syncFolder"
                      id="syncFolder"
                      className="form-check-input"
                      checked={values.syncFolder}
                      onChange={handleChange}
                    />
                  </div>
                  <br />
                  <br />
                  <Label
                    className={`${styles['form-check-label']}`}
                    for="syncFolder"
                  >
                    When enabled, files in this folder are automatically synced
                    into the map periodically.
                  </Label>
                </div>
              </FormGroup>
              {errorMessage && (
                <div className={`${styles['custom-error-message']}`}>
                  {errorMessage}
                </div>
              )}
              <ModalFooter className="justify-content-start">
                <Button size="short" type="secondary" onClick={toggle}>
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
