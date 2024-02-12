export type FormikInputProps = {
  name: string;
  label: string;
  required?: boolean;
  description?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export type FormikTextareaProps = {
  name: string;
  label: string;
  required?: boolean;
  description?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export type FormikSelectProps = {
  name: string;
  label: string;
  required?: boolean;
  description?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export { default as FormikInput } from './FormikInput';
export { default as FormikSelect } from './FormikSelect';
export { default as FormikCheck } from './FormikCheck';
export { default as FormikTextarea } from './FormikTextarea';
export { default as FormikFileInput } from './FormikFileInput/FormikFileInput';
