import React from 'react';
import FieldWrapper from '../FieldWrapperFormik';
import { useField } from 'formik';
import { FormikTextareaProps } from '.';

const FormikTextarea: React.FC<FormikTextareaProps> = ({
  name,
  label,
  required,
  description,
  ...props
}: FormikTextareaProps) => {
  const [field] = useField(name);
  return (
    <FieldWrapper
      name={name}
      label={label}
      required={required}
      description={description}
    >
      <textarea {...field} {...props} id={name} />
    </FieldWrapper>
  );
};

export default FormikTextarea;
