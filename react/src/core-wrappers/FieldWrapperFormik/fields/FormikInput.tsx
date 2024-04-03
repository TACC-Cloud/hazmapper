import React from 'react';
import FieldWrapper from '../FieldWrapperFormik';
import { useField } from 'formik';
import { FormikInputProps } from '.';

const FormikInput: React.FC<FormikInputProps> = ({
  name,
  label,
  required,
  description,
  ...props
}: FormikInputProps) => {
  const [field] = useField(name);
  return (
    <FieldWrapper
      name={name}
      label={label}
      required={required}
      description={description}
    >
      <input {...field} {...props} id={name} />
    </FieldWrapper>
  );
};

export default FormikInput;
