import React from 'react';
import { Modal, Layout, Flex, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Project } from '@hazmapper/types';
import { useDeleteProject } from '@hazmapper/hooks/projects/';
import { useNotification } from '@hazmapper/hooks';
import * as ROUTES from '@hazmapper/constants/routes';

type DeleteMapModalProps = {
  isOpen: boolean;
  close: () => void;
  project: Project;
};

const DeleteMapModal = ({
  isOpen,
  close: parentToggle,
  project,
}: DeleteMapModalProps) => {
  const navigate = useNavigate();
  const notification = useNotification();
  const {
    mutate: deleteProject,
    isPending: isDeletingProject,
    isError,
    isSuccess,
  } = useDeleteProject();

  const { Header } = Layout;

  const handleClose = () => {
    parentToggle();
  };

  const handleDeleteProject = () => {
    deleteProject(
      { projectId: project.id },
      {
        onSuccess: () => {
          parentToggle();
          navigate(ROUTES.MAIN);
          notification.success({
            description: 'Your map was successfully deleted.',
          });
        },
      }
    );
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={<Header>Delete Map: {project?.name}</Header>}
      onOk={handleDeleteProject}
      okText="Delete"
      cancelText={isSuccess ? 'Close' : 'Cancel'}
      okButtonProps={{
        loading: isDeletingProject,
        disabled: isSuccess || !project?.deletable,
      }}
    >
      <Flex vertical style={{ paddingBottom: 20 }}>
        {project?.deletable ? (
          <Alert
            type="warning"
            message={
              <span>
                Are you sure you want to delete this map? All associated
                features, metadata, and saved files will be deleted.
                <br />
                <br />
                {project?.public && (
                  <b>
                    {' '}
                    Note that this is a public map.
                    <br />
                    <br />
                  </b>
                )}
                <b>
                  <u>This cannot be undone.</u>
                </b>
              </span>
            }
          />
        ) : (
          "You don't have permission to delete this map."
        )}

        {isError && (
          <Flex justify="center" align="center" style={{ paddingTop: 20 }}>
            <Alert
              type="error"
              message="There was an error deleting your map."
            />
          </Flex>
        )}
      </Flex>
    </Modal>
  );
};

export default DeleteMapModal;
