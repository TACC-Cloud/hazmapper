import React, { useState, useEffect } from 'react';
import { Modal, Button, List, Tag, Spin, Typography } from 'antd';
import {
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

import { Project } from '@hazmapper/types';
import { useTasks } from '@hazmapper/hooks/';

const { Text } = Typography;

interface TasksViewDemoModalProps {
  activeProject: Project;
  isPublicView: boolean;
}

/**
 * A modal component for internal developers to view tasks demo.
 *
 * To open the modal, add `?showTasks=True` to the URL:
 * @example
 * ```
 * http://localhost:4200/project/e89eb53c-61c7-4fe0-9618-d279f02e65d4?showTasks=True
 * ```
 *
 * Note: Only available for non-public views (internal developers only).
 */
const TasksViewDemoModal: React.FC<TasksViewDemoModalProps> = ({
  activeProject,
  isPublicView,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const { data: tasks, isLoading } = useTasks({
    projectId: activeProject.id,
    options: {
      enabled: !isPublicView && isVisible,
      refetchInterval: isVisible ? 5000 : false, // Poll every 5 seconds
      refetchIntervalInBackground: false, // Stop polling when tab is not active
    },
  });

  useEffect(() => {
    // Only proceed if this is NOT a public view (internal devs only)
    if (isPublicView) {
      return;
    }

    // Parse URL query parameters
    const params = new URLSearchParams(window.location.search);
    const showTasks = params.get('showTasks');

    // Show modal if showTasks=True (case insensitive)
    if (showTasks && showTasks.toLowerCase() === 'true') {
      setIsVisible(true);
    }
  }, [isPublicView]);

  // Don't render anything if this is a public view
  if (isPublicView) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);

    const url = new URL(window.location.href);
    url.searchParams.delete('showTasks');
    window.history.replaceState({}, '', url.toString());
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'QUEUED':
        return {
          icon: <ClockCircleOutlined />,
          color: 'default',
          text: 'Queued',
        };
      case 'RUNNING':
        return {
          icon: <LoadingOutlined spin />,
          color: 'processing',
          text: 'Running',
        };
      case 'COMPLETED':
        return {
          icon: <CheckCircleOutlined />,
          color: 'success',
          text: 'Completed',
        };
      case 'FAILED':
        return {
          icon: <CloseCircleOutlined />,
          color: 'error',
          text: 'Failed',
        };
      case 'ERROR':
        return {
          icon: <ExclamationCircleOutlined />,
          color: 'error',
          text: 'Error',
        };
      default:
        return {
          icon: null,
          color: 'default',
          text: status,
        };
    }
  };

  // Sort tasks by created date (most recent first)
  const sortedTasks = tasks
    ? [...tasks].sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
      )
    : [];

  return (
    <Modal
      title={`Tasks - ${activeProject.name}`}
      open={isVisible}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          Close
        </Button>,
      ]}
      width={700}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <List
          dataSource={sortedTasks}
          style={{ maxHeight: '500px', overflowY: 'auto' }}
          renderItem={(task) => {
            const statusDisplay = getStatusDisplay(task.status);
            return (
              <List.Item>
                <List.Item.Meta
                  avatar={statusDisplay.icon}
                  title={
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Text strong>{task.description || 'No description'}</Text>
                      <Tag
                        icon={statusDisplay.icon}
                        color={statusDisplay.color}
                      >
                        {statusDisplay.text}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary">
                        Created: {new Date(task.created).toLocaleString()}
                      </Text>
                      {task.updated && (
                        <>
                          <br />
                          <Text type="secondary">
                            Updated: {new Date(task.updated).toLocaleString()}
                          </Text>
                        </>
                      )}
                      {task.latest_message && (
                        <>
                          <br />
                          <Text type="secondary">
                            Message: {task.latest_message}
                          </Text>
                        </>
                      )}
                    </div>
                  }
                />
              </List.Item>
            );
          }}
          locale={{ emptyText: 'No tasks found' }}
        />
      )}
    </Modal>
  );
};

export default TasksViewDemoModal;
