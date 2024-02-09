import React from 'react';
import { ErrorMessage } from 'formik';
import { Badge } from 'reactstrap';

import './FieldWrapperFormik.global.css';

export type FieldWrapperProps = {
  name: string;
  label: React.ReactNode;
  required?: boolean;
  className?: string;
  description?: React.ReactNode;
};
const FieldWrapper: React.FC<React.PropsWithChildren<FieldWrapperProps>> = ({
  name,
  label,
  required,
  description,
  className,
  children,
}) => {
  return (
    <div
      className={`c-form__field ${required ? 'has-required' : ''} ${className}`}
    >
      <label htmlFor={name}>
        {label}
        {required && <Badge color="danger">Required</Badge>}
      </label>
      {children}
      <ErrorMessage name={name}>
        {(msg) => {
          return (
            <ul className="c-form__errors">
              <li>{msg}</li>
            </ul>
          );
        }}
      </ErrorMessage>
      {description && <div className="c-form__help">{description}</div>}
    </div>
  );
};

export default FieldWrapper;
