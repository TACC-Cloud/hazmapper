import React from 'react';
import { Modal, Button } from 'antd';

import { Project } from '@hazmapper/types';

import { FileAccessibilityInformation } from './FileAccessibilityInformation';

interface FileAccessibilityModalProps {
  project: Project;
  open: boolean;
  onClose: () => void;
}

export const FileAccessibilityModal: React.FC<FileAccessibilityModalProps> = ({
  project,
  open,
  onClose,
}) => {
  return (
    <Modal
      title={`File Accessibility Validation Check`}
      open={open}
      onCancel={onClose}
      width="80%"
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <FileAccessibilityInformation project={project} hasCheckButton />
    </Modal>
  );
};
