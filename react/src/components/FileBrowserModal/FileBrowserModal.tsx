import React from 'react';
import { Modal, Button, Layout, Typography } from 'antd';
import { FileListing } from '../Files';

type FileBrowserModalProps = {
  isOpen: boolean;
  toggle: () => void;
  allowedFileExtensions?: string[];
};

const { Content, Header } = Layout;
const { Text } = Typography;

const FileBrowserModal = ({
  isOpen,
  toggle: parentToggle,
  allowedFileExtensions = [],
}: FileBrowserModalProps) => {
  const handleClose = () => {
    parentToggle();
  };

  return (
    <Modal
      title={<Header style={{ fontSize: '2rem' }}>Select Files</Header>}
      open={isOpen}
      onCancel={handleClose}
      zIndex={
        2000 /* TODO define somewhere to be reusable in different modals */
      }
      footer={[
        <Button key="closeModalButton" onClick={handleClose}>
          Cancel
        </Button>,
        <Button key="importFilesButton" htmlType="submit" type="primary">
          Import
        </Button>,
      ]}
      width={800}
    >
      <Content>
        <Text type="secondary">
          Allowed file types: shp, jpg, jpeg, json, geojson, gpx, rq
        </Text>
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
          />
        </div>
      </Content>
    </Modal>
  );
};

export default FileBrowserModal;
