import React, { useState } from 'react';
import { Project, ProjectRequest } from '@hazmapper/types';
import { Flex, Button, Card, Typography, Modal } from 'antd';
import { CopyFilled, CopyOutlined, GlobalOutlined } from '@ant-design/icons';
import { useAppConfiguration } from '@hazmapper/hooks';

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
  const config = useAppConfiguration();
  const togglePublic = () => {
    onProjectUpdate({ public: !project.public });
    setIsModalOpen(false);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                text: `https://hazmapper.tacc.utexas.edu${config.basePath}project-public/${project.uuid}`,
                icon: [
                  <CopyOutlined key="copy-icon" style={{ color: '#74B566' }} />,
                  <CopyFilled key="copied-icon" />,
                ],
                tooltips: ['Copy Text', 'Copied'],
              }}
            >
              <Button
                type="link"
                style={{ textWrap: 'wrap', textAlign: 'justify' }}
                href={`${config.basePath}project-public/${project.uuid}`}
                target="_blank"
                rel="noreferrer"
              >{`https://hazmapper.tacc.utexas.edu${config.basePath}project-public/${project.uuid}`}</Button>
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
