import React, { useState, useEffect } from 'react';
import styles from './ManageMapProjectPanel.module.css';
import type { TabsProps } from 'antd';
import { Flex, Tabs, notification, Card } from 'antd';
import { Project, ProjectRequest } from '@hazmapper/types';
import MapTabContent from './MapTabContent';
import MembersTabContent from './MembersTabContent';
import PublicTabContent from './PublicTabContent';
import { useUpdateProjectInfo } from '@hazmapper/hooks';
import SaveTabContent from './SaveTabContent';

interface ManageMapProjectModalProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
}

const ManageMapProjectPanel: React.FC<ManageMapProjectModalProps> = ({
  project: initialProject,
  onProjectUpdate,
}) => {
  const [activeKey, setActiveKey] = useState('1');
  const [activeProject, setActiveProject] = useState(initialProject);
  const [updateApi, contextHolder] = notification.useNotification();

  const { mutate, isPending } = useUpdateProjectInfo();

  // Update activeProject when initialProject changes
  useEffect(() => {
    setActiveProject(initialProject);
  }, [initialProject]);

  const handleProjectUpdate = (updateData: Partial<ProjectRequest>) => {
    const newData: ProjectRequest = {
      name: updateData.name ?? activeProject.name,
      description: updateData.description ?? activeProject.description,
      public: updateData.public ?? activeProject.public,
    };

    mutate(newData, {
      onSuccess: (updatedProject) => {
        setActiveProject((prev) => {
          const newState = {
            ...prev,
            name: updatedProject.name,
            description: updatedProject.description,
            public: updatedProject.public,
          };
          return newState;
        });
        onProjectUpdate?.(updatedProject);
        updateApi.open({
          type: 'success',
          message: 'Success!',
          description: 'Your project was successfully updated.',
          placement: 'topRight',
          closable: false,
        });
      },
      onError: () => {
        updateApi.open({
          type: 'error',
          message: 'Error!',
          description: 'There was an error updating your project.',
          placement: 'topRight',
          closable: false,
        });
      },
    });
  };

  const items: TabsProps['items'] = [
    {
      label: 'Map',
      key: '1',
      children: (
        <Card title="Map Details" type="inner">
          <MapTabContent
            project={activeProject}
            onProjectUpdate={handleProjectUpdate}
            isPending={isPending}
          />
        </Card>
      ),
    },
    {
      label: 'Members',
      key: '2',
      children: (
        <Card title="Members" type="inner">
          <MembersTabContent project={activeProject} />
        </Card>
      ),
    },
    {
      label: 'Public',
      key: '3',
      children: (
        <Card type="inner" title="Public Access">
          <PublicTabContent
            project={activeProject}
            onProjectUpdate={handleProjectUpdate}
            isPending={isPending}
          />
        </Card>
      ),
    },
    {
      label: 'Save',
      key: '4',
      children: (
        <Card type="inner" title="Save Location">
          <SaveTabContent project={activeProject}></SaveTabContent>
        </Card>
      ),
    },
  ];

  return (
    <Flex vertical className={styles.root}>
      {contextHolder}
      <Tabs
        type="card"
        size="small"
        activeKey={activeKey}
        onChange={setActiveKey}
        items={items}
        style={{ marginTop: 20, marginLeft: 30, marginRight: 30 }}
      />
    </Flex>
  );
};

export default ManageMapProjectPanel;
