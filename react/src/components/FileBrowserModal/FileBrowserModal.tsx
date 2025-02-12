import React, { useState } from 'react';
import { Modal, Button, Layout, Typography } from 'antd';
import { FileListing } from '../Files';
import { File, TapisFilePath } from '@hazmapper/types';
import { convertFilesToTapisPaths } from '@hazmapper/utils/fileUtils';

type FileBrowserModalProps = {
  isOpen: boolean;
  toggle: () => void;
  onImported?: (files: TapisFilePath[]) => void;
  allowedFileExtensions: string[];
};

const { Content, Header } = Layout;
const { Text } = Typography;

const FileBrowserModal = ({
  isOpen,
  toggle: parentToggle,
  onImported,
  allowedFileExtensions = [],
}: FileBrowserModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleClose = () => {
    parentToggle();
  };

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleImport = () => {
    if (onImported) {
      const tapisFilePaths = convertFilesToTapisPaths(selectedFiles);
      onImported(tapisFilePaths);
    }
    handleClose();
  };

  return (
    <Modal
      title={<Header style={{ fontSize: '2rem' }}>Select Files</Header>}
      open={isOpen}
      onCancel={handleClose}
      footer={[
        <Text key="fileCount" type="secondary" style={{ marginRight: 16 }}>
          {selectedFiles.length > 0 && `${selectedFiles.length} files selected`}
        </Text>,
        <Button key="closeModalButton" onClick={handleClose}>
          Cancel
        </Button>,
        <Button
          key="importFilesButton"
          htmlType="submit"
          type="primary"
          onClick={handleImport}
          disabled={selectedFiles.length === 0} // Disable if no files are selected
        >
          Import
        </Button>,
      ]}
      width={800}
    >
      <Content>
        {allowedFileExtensions?.length && (
          <Text type="secondary">
            Allowed file types: {allowedFileExtensions.join(', ')}
          </Text>
        )}
        <br />
        <Text type="secondary">
          Note: Only files are selectable, not folders. Double-click on a folder
          to navigate into it.
        </Text>
        <div style={{ marginTop: '1rem' }}>
          <FileListing
            disableSelection={false}
            showPublicSystems={true}
            allowedFileExtensions={allowedFileExtensions}
            onFileSelect={handleFileSelect}
          />
        </div>
      </Content>
    </Modal>
  );
};

export default FileBrowserModal;
