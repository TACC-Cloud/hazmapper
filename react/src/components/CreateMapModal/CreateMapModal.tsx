import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Button, Section, SectionTableWrapper } from '@tacc/core-components';
import styles from './CreateMapModal.module.css';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import useCreateProject from '@hazmapper/hooks/projects/useCreateProject';
import useAuthenticatedUser from '@hazmapper/hooks/user/useAuthenticatedUser';
import { useNavigate } from 'react-router-dom';
import { ProjectRequest } from '@hazmapper/types';
import {
  FormikInput,
  FormikTextarea,
  FormikCheck,
} from '@tacc/core-components';
import { FileListing } from '../Files';

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
  const { mutate: createProject, isPending: isCreatingProject } =
    useCreateProject();
  const navigate = useNavigate();
  const handleClose = () => {
    setErrorMessage(''); // Clear the error message
    parentToggle(); // Call the original toggle function passed as a prop
  };

  const [saveLocation, setSaveLocation] = useState('');

  const handleDirectoryChange = (directory: string) => {
    setSaveLocation(directory);
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
    <Modal isOpen={isOpen} toggle={handleClose} size="xl">
      <ModalHeader toggle={handleClose}>Create a New Map</ModalHeader>
      <ModalBody>
        <Section
          bodyClassName="has-loaded-dashboard"
          contentLayoutName={'twoColumn'}
          // contentShouldScroll
          className={`${styles['section']}`}
          content={
            <>
              <SectionTableWrapper>
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
                  initialStatus={{ oldName: '' }}
                >
                  {({ values, setFieldValue, setStatus, status }) => {
                    // Replace spaces with underscores for system_file mirroring
                    const systemFileName = values.name.replace(/\s+/g, '_');

                    // Update system_file only if it matches the previous name and if name/system_file are different
                    if (
                      values.system_file === status.oldName &&
                      values.system_file !== systemFileName
                    ) {
                      setFieldValue('system_file', systemFileName);
                      setStatus({ oldName: systemFileName });
                    }

                    return (
                      <Form className="c-form" name="map-form-info">
                        {/* TODO: Remove superfluous empty tag, and re-nest markup */}
                        {/* NOTE: Added to simplify diff of PR #239 */}
                        <>
                          <Field
                            component={FormikInput}
                            name="name"
                            label="Name"
                            required
                            data-testid="name-input"
                          />
                          <Field
                            component={FormikTextarea}
                            name="description"
                            label="Description"
                            required
                          />
                          <div className={`${styles['field-wrapper']}`}>
                            <Field
                              component={FormikInput}
                              name="system_file"
                              label="Custom File Name"
                              required
                              className={`${styles['input-custom-size']}`}
                            />
                            <span className={`${styles['hazmapper-suffix']}`}>
                              .hazmapper
                            </span>
                          </div>
                          <div className={`${styles['field-wrapper-alt']}`}>
                            <Field
                              component={FormikInput}
                              name="save-location"
                              label="Save Location"
                              value={saveLocation}
                              readOnly
                              disabled
                            />
                          </div>
                          <Field
                            component={FormikCheck}
                            name="syncFolder"
                            label="Sync Folder"
                            description="When enabled, files in this folder are automatically synced into the map periodically."
                          />
                        </>
                        {errorMessage && (
                          <div className="c-form__errors">{errorMessage}</div>
                        )}
                        <ModalFooter className="justify-content-start">
                          <Button
                            size="short"
                            type="secondary"
                            onClick={handleClose}
                          >
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
                    );
                  }}
                </Formik>
              </SectionTableWrapper>
              <SectionTableWrapper
                manualHeader={
                  <>
                    <h2 className={`${styles['link-heading']}`}>
                      Select Link Save Location
                    </h2>
                    <h4 className={`${styles['link-subheading']}`}>
                      If no folder is selected, the link file will be saved to
                      the root of the selected system.If you select a project,
                      you can link the current map to the project.
                    </h4>
                  </>
                }
                manualContent={
                  <FileListing
                    disableSelection={false}
                    onFolderSelect={handleDirectoryChange}
                    showPublicSystems={false}
                  />
                }
              />
            </>
          }
        />
      </ModalBody>
    </Modal>
  );
};

export default CreateMapModal;
