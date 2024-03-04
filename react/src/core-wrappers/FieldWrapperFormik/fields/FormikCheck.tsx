import React from 'react';
import { Field, FieldInputProps } from 'formik';
import { FormikInputProps } from '.';
import { Input, FormText, FormGroup, Label } from 'reactstrap';
import styles from './FormikCheck.module.css';

const FormikCheck: React.FC<FormikInputProps> = ({
  name,
  label,
  required,
  description,
  ...props
}: FormikInputProps) => {
  return (
    <>
      <Label
        htmlFor={name}
        className={`form-field__label ${styles.nospace}`}
        size="md"
      >
        {label}
      </Label>
      <FormGroup check className={`${styles.checkWrapper}`}>
        <Field
          name={name}
          as={(formikProps: FieldInputProps<any>) => (
            <Input
              {...props}
              {...formikProps}
              id={name}
              type="checkbox"
              checked={formikProps.value}
              bsSize="sm"
            />
          )}
        />
        <FormText
          className={`form-field__help ${styles.nospace} ${styles.customDescription}`}
          color="muted"
        >
          {description}
        </FormText>
      </FormGroup>
    </>
  );
};

export default FormikCheck;
