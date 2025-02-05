import React from 'react';
import { Project } from '@hazmapper/types';
import { List } from 'antd';

interface SaveTabProps {
  project: Project;
}

const SaveTabContent: React.FC<SaveTabProps> = ({ project }) => {
  return (
    <List>
      <List.Item>
        <List.Item.Meta
          title="File"
          description={`${project.system_file}.hazmapper`}
        />
      </List.Item>
      <List.Item>
        <List.Item.Meta title="Path" description={project.system_path} />
      </List.Item>
      <List.Item>
        <List.Item.Meta title="System" description={project.system_id} />
      </List.Item>
    </List>
  );
};
export default SaveTabContent;
