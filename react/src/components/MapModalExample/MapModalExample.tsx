import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FieldWrapper from '../../core-wrappers/FieldWrapperFormik/FieldWrapperFormik';
import { FormikInput, FormikTextarea } from '../../core-wrappers';
import { Button } from '../../core-components';

const initialValues = {
  mapName: '',
  mapDescription: '',
  system_file: '',
};

type MapModalExampleProps = {
  isOpen: boolean;
  toggle: () => void;
};

// Yup validation schema
const validationSchema = Yup.object({
  mapName: Yup.string().required('Name is required'),
  mapDescription: Yup.string().required('Description is required'),
  system_file: Yup.string()
    .matches(
      /^[A-Za-z0-9-_]+$/,
      'Only letters, numbers, hyphens, and underscores are allowed'
    )
    .required(' File name is required'),
});

const MapModalExample = ({ isOpen, toggle }: MapModalExampleProps) => {
  const handleSubmit = (values) => {
    console.log(values);
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Create a New Map</ModalHeader>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <Form>
          <ModalBody>
            <FieldWrapper name="map-info-wrapper" label="">
              <FormikInput name="mapName" label="Map Name" required />
              <FormikTextarea
                name="mapDescription"
                label="Description"
                required
              />
              <FormikInput
                name="system_file"
                label="Custom File Name"
                required
              />
            </FieldWrapper>
          </ModalBody>
          <ModalFooter className="justify-content-start">
            <Button size="short" type="secondary" onClick={toggle}>
              Close
            </Button>
            <Button size="short" type="primary" attr="submit">
              Create
            </Button>
          </ModalFooter>
        </Form>
      </Formik>
    </Modal>
  );
};

export default MapModalExample;
