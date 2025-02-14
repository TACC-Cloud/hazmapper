import React, { useState } from 'react';
import { Modal, Button, Layout, Typography, Flex } from 'antd';
import { FileListing } from '../Files';
import { File, TapisFilePath } from '@hazmapper/types';
import { convertFilesToTapisPaths } from '@hazmapper/utils/fileUtils';
import { SectionMessage } from '@tacc/core-components';

type FileBrowserModalProps = {
  isOpen: boolean;
  toggle: () => void;
  onImported?: (files: TapisFilePath[]) => void;
  allowedFileExtensions: string[];
  singleSelectErrorMessage?: string;
  isSingleSelectMode?: boolean;
};

const { Content, Header } = Layout;
const { Text } = Typography;

const FileBrowserModal = ({
  isOpen,
  toggle: parentToggle,
  onImported,
  allowedFileExtensions = [],
  isSingleSelectMode = false,
  singleSelectErrorMessage = '',
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
      title={
        <Header style={{ fontSize: '2rem' }}>
          Select File{!isSingleSelectMode && 's'}
        </Header>
      }
      open={isOpen}
      onCancel={handleClose}
      footer={[
        <Text key="fileCount" type="secondary" style={{ marginRight: 16 }}>
          <Flex vertical justify="space-evenly">
            {isSingleSelectMode && selectedFiles.length > 1 && (
              <SectionMessage type="error">
                {singleSelectErrorMessage}
              </SectionMessage>
            )}
            <Flex justify="space-between">
              {isSingleSelectMode && <div>You may only import one file.</div>}
              {selectedFiles.length > 0 &&
                `${selectedFiles.length} files selected`}
            </Flex>
          </Flex>
        </Text>,
        <Button key="closeModalButton" onClick={handleClose}>
          Cancel
        </Button>,
        <Button
          key="importFilesButton"
          htmlType="submit"
          type="primary"
          onClick={handleImport}
          disabled={
            selectedFiles.length === 0 ||
            (isSingleSelectMode && selectedFiles.length > 1)
          } // Disable if no files are selected. If single select mode, disable if multiple files are selected
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
          to navigate into it.{' '}
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
