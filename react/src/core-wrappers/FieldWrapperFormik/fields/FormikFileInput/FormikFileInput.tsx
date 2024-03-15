/* FP-993: Allow use by DataFilesUploadModal */
import React from 'react';
import { useField } from 'formik';
import FileInputDropZone from './FileDropzone';
import FieldWrapper from '../../FieldWrapperFormik';

interface FormikFileInputProps {
  name: string;
  label: string;
  required: boolean;
  description: string;
  maxSizeMessage: string;
  maxSize: number;
}

const FileInputDropZoneFormField: React.FC<FormikFileInputProps> = ({
  name,
  label,
  description,
  maxSizeMessage,
  maxSize,
  required,
}) => {
  const [field, , helpers] = useField<File[]>(name);

  const onSetFiles = (acceptedFiles: File[]) => {
    const newAcceptedFiles = acceptedFiles.filter(
      (newFile) =>
        !field.value.some((prevFile) => prevFile.name === newFile.name)
    );
    helpers.setValue([...field.value, ...newAcceptedFiles]);
  };
  const onRemoveFile = (fileIndex: number) => {
    helpers.setValue(field.value.filter((_, i) => i !== fileIndex));
  };
  return (
    <FieldWrapper
      name={name}
      label={label}
      required={required}
      description={description}
    >
      <FileInputDropZone
        files={field.value}
        onDrop={onSetFiles}
        onRemoveFile={onRemoveFile}
        maxSizeMessage={maxSizeMessage}
        maxSize={maxSize}
      />
    </FieldWrapper>
  );
};

export default FileInputDropZoneFormField;
