import React from 'react';
import { Project } from '@hazmapper/types';
import { Flex, List } from 'antd';

interface PublicInfoProps {
  project: Project;
  isPublicView: boolean;
}

const PublicInfoPanel: React.FC<PublicInfoProps> = ({
  project,
  isPublicView,
}) => {
  return (
    <>
      {isPublicView && (
        <Flex vertical justify="center">
          <List itemLayout="vertical">
            <List.Item>
              <List.Item.Meta title={'Name:'} style={{ marginBottom: 0 }} />
              {project.name}
            </List.Item>
            <List.Item>
              <List.Item.Meta
                title={'Description:'}
                style={{ marginBottom: 0 }}
              />
              {project.description}
            </List.Item>
          </List>
        </Flex>
      )}
    </>
  );
};
export default PublicInfoPanel;
