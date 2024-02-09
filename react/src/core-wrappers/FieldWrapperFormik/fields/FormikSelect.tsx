import React from 'react';
import FieldWrapper from '../FieldWrapperFormik';
import { useField } from 'formik';
import { FormikSelectProps } from '.';

const FormikTextarea: React.FC<FormikSelectProps> = ({
  name,
  label,
  required,
  description,
  children,
  ...props
}: FormikSelectProps) => {
  const [field] = useField(name);
  return (
    <FieldWrapper
      name={name}
      label={label}
      required={required}
      description={description}
    >
      <select {...field} {...props} id={name}>
        {children}
      </select>
    </FieldWrapper>
  );
};

export default FormikTextarea;
