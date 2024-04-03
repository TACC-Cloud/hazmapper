/* FP-993: Allow use by DataFilesUploadModal */
import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { InlineMessage, Button } from '../../../../core-components';
import styles from './FileDropzone.module.css';

interface FileInputDropzoneProps {
  files: File[];
  onDrop: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  maxSize: number;
  maxSizeMessage: string;
}

/**
 * FileInputDropZone is a component where users can select files via file browser or by
 * drag/drop.  an area to drop files. If `file` property is set then files are listed
 * and user can manage (e.g. delete those files) directly in this component.
 */
const FileInputDropZone: React.FC<FileInputDropzoneProps> = ({
  files,
  onDrop,
  maxSize,
  maxSizeMessage,
  onRemoveFile,
}) => {
  const [rejectedFiles, setRejectedFiles] = useState<FileRejection[]>([]);

  const onDropRejected = useCallback(
    (rejected: FileRejection[]) => {
      const newRejectedFiles = rejected.filter(
        (newFile) =>
          !rejectedFiles.some(
            (prevFile) => prevFile.file.name === newFile.file.name
          )
      );
      setRejectedFiles([...rejectedFiles, ...newRejectedFiles]);
    },
    [rejectedFiles]
  );

  const { getRootProps, open, getInputProps } = useDropzone({
    noClick: true,
    maxSize,
    onDrop: (files) => {
      onDrop(files);
      setRejectedFiles([]);
    },
    onDropRejected,
  });

  const removeFile = (fileIndex: number) => {
    if (onRemoveFile) {
      onRemoveFile(fileIndex);
    }
  };

  const showFileList = files.length > 0 || rejectedFiles.length > 0;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div {...getRootProps()} className={styles['dropzone-area']}>
      <input {...getInputProps()} data-testid="dropzone-input" />
      {!showFileList && (
        <div className={styles['no-attachment-view']}>
          <i className="icon icon-upload" />
          <br />
          <Button type="secondary" onClick={open}>
            Select File(s)
          </Button>
          <strong>or</strong>
          <strong>Drag and Drop</strong>
          <br />
          <p>{maxSizeMessage}</p>
        </div>
      )}
      {showFileList && (
        <div className={styles['attachment-view']}>
          <div>
            {rejectedFiles &&
              rejectedFiles.map((f, i) => (
                <div className={styles['attachment-block']} key={f.file.name}>
                  <span className="d-inline-block text-truncate">
                    {f.file.name}
                  </span>
                  <InlineMessage type="error">
                    Exceeds File Size Limit
                  </InlineMessage>
                </div>
              ))}
            {files.map((f, i) => (
              <div className={styles['attachment-block']} key={f.name}>
                <span className="d-inline-block text-truncate">{f.name}</span>
                <Button
                  type="link"
                  onClick={() => {
                    removeFile(i);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="secondary"
            className={styles['dropzone-select-more']}
            onClick={open}
          >
            Select File(s)
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileInputDropZone;
