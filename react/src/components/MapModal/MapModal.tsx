import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useGetGeoapiUserInfoQuery } from '../../redux/api/geoapi';
import { AuthenticatedUser } from '../../types/auth';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

type MapModalProps = {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (values: any) => void;
  isCreating: boolean;
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

const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  toggle,
  onSubmit,
  isCreating,
}) => {
  // Fetch user info from the API
  useGetGeoapiUserInfoQuery();

  // Access the user info from the Redux state
  const user = useSelector(
    (state: RootState) => state.auth.user
  ) as AuthenticatedUser & { name: string };

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
          onSubmit={(values, actions) => {
            // Check if user information is available
            if (!user) {
              console.error('User information is not available');
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
                system_path: `/${user.name}`,
              },
            };
            onSubmit(projectData);
            actions.setSubmitting(false);
          }}
        >
          {({ errors, touched, values, handleChange }) => (
            <Form>
              <FormGroup>
                <Label for="name">Name</Label>
                <Field
                  name="name"
                  id="name"
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
                  <span className="input-group-text col-sm-4">.hazmapper</span>
                </div>
                {/* Alt solution to render error message bc input group was causing text to not display properly */}
                {touched.system_file && errors.system_file && (
                  <div
                    className="custom-error-message"
                    style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875em',
                      color: 'var(--bs-danger)',
                    }}
                  >
                    {errors.system_file}
                  </div>
                )}
              </FormGroup>
              <FormGroup className="row align-items-center">
                <Label className="col-sm-4">Save Location:</Label>
                <div className="col-sm-8 text-primary">
                  {user ? `/${user.name}` : 'Loading...'}
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
                  <Label
                    className="form-check-label"
                    for="syncFolder"
                    style={{ fontStyle: 'italic' }}
                  >
                    When enabled, files in this folder are automatically synced
                    into the map periodically.
                  </Label>
                </div>
              </FormGroup>
              <ModalFooter className="justify-content-start">
                <Button color="warning" type="button" onClick={toggle}>
                  Close
                </Button>
                <Button color="primary" type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalBody>
    </Modal>
  );
};

export default MapModal;
