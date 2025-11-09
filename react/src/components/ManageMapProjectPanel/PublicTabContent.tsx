import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Project, ProjectRequest } from '@hazmapper/types';
import {
  FileAccessibilityInformation,
  FileAccessibilityModal,
} from '@hazmapper/components/FileAccessibilityModal';

import { Flex, Button, Card, Typography, Modal } from 'antd';
import {
  CopyFilled,
  CopyOutlined,
  GlobalOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface PublicTabProps {
  project: Project;
  onProjectUpdate: (updateData: Partial<ProjectRequest>) => void;
  isPending: boolean;
}

const PublicTabContent: React.FC<PublicTabProps> = ({
  project,
  onProjectUpdate,
  isPending,
}) => {
  const toggleMakePublicModal = () => {
    onProjectUpdate({ public: !project.public });
    setIsMakePublicModalOpen(false);
  };
  const [isMakePublicModalOpen, setIsMakePublicModalOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const showFileAccessibilityModal =
    searchParams.get('showFileAccessibility') === 'true';

  const handleOpenFileAccessibilityModal = () => {
    setSearchParams((prev) => {
      prev.set('showFileAccessibility', 'true');
      return prev;
    });
  };

  const handleCloseFileAccessibilityModal = () => {
    searchParams.delete('showFileAccessibility');
    setSearchParams(searchParams);
  };

  const publicPath = `${window.location.origin}${window.location.pathname.replace(
    '/project/',
    '/project-public/'
  )}`;

  const { Paragraph } = Typography;
  return (
    <Flex vertical gap="small">
      {project.public ? (
        <>
          This map is public and can be viewed by anyone with this link:
          <Card
            style={{ backgroundColor: 'var(--global-color-primary--x-light)' }}
          >
            <Paragraph
              style={{ display: 'flex', justifyContent: 'space-evenly' }}
              copyable={{
                text: `${publicPath}`,
                icon: [
                  <CopyOutlined key="copy-icon" style={{ color: '#74B566' }} />,
                  <CopyFilled key="copied-icon" />,
                ],
                tooltips: ['Copy Text', 'Copied'],
              }}
            >
              <Button
                type="link"
                style={{
                  textWrap: 'wrap',
                  textAlign: 'justify',
                  display: 'contents',
                }}
                href={`${publicPath}`}
                target="_blank"
                rel="noreferrer"
              >{`${publicPath}`}</Button>
            </Paragraph>
          </Card>
        </>
      ) : (
        <>This map is private and can only be viewed by team members.</>
      )}
      <Button
        type="primary"
        icon={<GlobalOutlined />}
        onClick={() => setIsMakePublicModalOpen(true)}
        loading={isPending}
      >
        Make {project.public ? 'Private' : 'Public'}
      </Button>

      <Flex vertical gap="4px" style={{ marginTop: '12px' }}>
        <Button
          icon={<FileSearchOutlined />}
          onClick={handleOpenFileAccessibilityModal}
          type="default"
        >
          View File Accessibility
        </Button>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Check if your project files are accessible to public in DesignSafe.
        </Text>
      </Flex>

      {showFileAccessibilityModal && (
        <FileAccessibilityModal
          project={project}
          open={showFileAccessibilityModal}
          onClose={handleCloseFileAccessibilityModal}
        />
      )}

      <Modal
        open={isMakePublicModalOpen}
        width="80%"
        title={`Make Map ${project.public ? 'Private' : ' Public'}`}
        onOk={toggleMakePublicModal}
        onCancel={() => setIsMakePublicModalOpen(!isMakePublicModalOpen)}
      >
        <FileAccessibilityInformation
          project={project}
          additionalText={`Are you sure you want to make this map ${project.public ? 'private' : ' public'}?`}
        />
      </Modal>
    </Flex>
  );
};

export default PublicTabContent;
