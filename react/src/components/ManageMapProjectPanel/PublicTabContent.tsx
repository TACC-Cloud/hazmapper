import React, { useState } from 'react';
import { Project, ProjectRequest } from '@hazmapper/types';
import { Flex, Button, Card, Typography, Modal } from 'antd';
import { CopyFilled, CopyOutlined, GlobalOutlined } from '@ant-design/icons';

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
  const togglePublic = () => {
    onProjectUpdate({ public: !project.public });
    setIsModalOpen(false);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        onClick={() => setIsModalOpen(true)}
        loading={isPending}
      >
        Make {project.public ? 'Private' : 'Public'}
      </Button>
      <Modal
        open={isModalOpen}
        title={`Make Map ${project.public ? 'Private' : ' Public'}`}
        onOk={togglePublic}
        onCancel={() => setIsModalOpen(!isModalOpen)}
      >
        {`Are you sure you want to make this map ${project.public ? 'private' : ' public'}?`}
      </Modal>
    </Flex>
  );
};

export default PublicTabContent;
