import React, { useState, useEffect } from 'react';
import styles from './ManageMapProjectPanel.module.css';
import type { TabsProps } from 'antd';
import { Flex, Tabs } from 'antd';
import { Project } from '@hazmapper/types';
import MapTabContent from './MapTabContent';

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

  // Update activeProject when initialProject changes
  useEffect(() => {
    setActiveProject(initialProject);
  }, [initialProject]);

  const handleProjectUpdate = (updatedProject: Project) => {
    setActiveProject(updatedProject);
    onProjectUpdate?.(updatedProject);
  };

  const items: TabsProps['items'] = [
    {
      label: 'Map',
      key: '1',
      children: (
        <MapTabContent
          project={activeProject}
          onProjectUpdate={handleProjectUpdate}
        />
      ),
    },
    {
      label: 'Members',
      key: '2',
      children: 'TODO',
    },
    {
      label: 'Public',
      key: '3',
      children: 'TODO',
    },
    {
      label: 'Save',
      key: '4',
      children: 'TODO',
    },
  ];

  return (
    <Flex vertical className={styles.root}>
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
