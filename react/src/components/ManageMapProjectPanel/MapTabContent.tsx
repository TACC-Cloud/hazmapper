import React, { useState } from 'react';
import { Project } from '@hazmapper/types';
import { SectionMessage } from '@tacc/core-components';
import { EditFilled, CheckOutlined } from '@ant-design/icons';
import { Button, Flex, List, Input, Modal, notification } from 'antd';
import { useUpdateProjectInfo } from '@hazmapper/hooks';
import DeleteMapModal from '../DeleteMapModal/DeleteMapModal';

interface MapTabProps {
  project: Project;
  onProjectUpdate: (updatedProject: Project) => void;
}

const MapTabContent: React.FC<MapTabProps> = ({ project, onProjectUpdate }) => {
  //Editing map
  const [editProjectField, setEditProjectField] = useState({});
  const [isEditModalOpen, setisEditModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState<
    'name' | 'description' | null
  >(null);
  const [editValue, setEditValue] = useState('');
  /* antd hook to manage notifications*/
  const [updateApi, contextHolder] = notification.useNotification();
  const [validationError, setValidationError] = useState(false);
  const { mutate, isPending, reset } = useUpdateProjectInfo();

  const handleEditClick = (fieldName: 'name' | 'description') => {
    setCurrentField(fieldName);
    setEditValue(project[fieldName]);
    setisEditModalOpen(true);
    setEditProjectField({
      ...editProjectField,
      [fieldName]: !editProjectField[fieldName],
    });
  };

  const onEditSubmit = () => {
    if (!currentField) return;

    if (!editValue.trim()) {
      setValidationError(true);
      return;
    }
    setValidationError(false);

    const updateData = {
      name: currentField === 'name' ? editValue : project.name,
      description:
        currentField === 'description' ? editValue : project.description,
      public: project.public,
    };

    mutate(updateData, {
      onSuccess: (updatedProject) => {
        setisEditModalOpen(false);
        setCurrentField(null);
        setEditProjectField({});
        onProjectUpdate?.(updatedProject);
        updateApi.open({
          type: 'success',
          message: '',
          description: 'Your project was successfully updated.',
          placement: 'topRight',
          onClose: () => reset(),
        });
      },
      onError: () => {
        updateApi.open({
          type: 'error',
          message: 'Error!',
          description: 'There was an error updating your project.',
          placement: 'topRight',
          onClose: () => reset(),
        });
      },
    });
  };

  const handleEditModalCancel = () => {
    setisEditModalOpen(false);
    setValidationError(false);
    setCurrentField(null);
    setEditProjectField({});
    reset();
  };

  //Deleting map
  const [isDeleteModalOpen, setisDeleteModalOpen] = useState(false);
  const handleDeleteClose = () => {
    setisDeleteModalOpen(false);
  };

  return (
    <>
      {contextHolder}
      <Flex vertical justify="center">
        <List itemLayout="vertical" style={{ marginLeft: 20, marginRight: 20 }}>
          <List.Item>
            <List.Item.Meta title={'Name:'} style={{ marginBottom: 0 }} />
            <Flex justify="space-between">
              {project.name}
              <Button
                onClick={() => handleEditClick('name')}
                type="text"
                icon={
                  editProjectField['name'] ? <CheckOutlined /> : <EditFilled />
                }
              />
            </Flex>
          </List.Item>
          <List.Item>
            <List.Item.Meta
              title={'Description:'}
              style={{ marginBottom: 0 }}
            />
            <Flex justify="space-between">
              {project.description}
              <Button
                onClick={() => handleEditClick('description')}
                type="text"
                icon={
                  editProjectField['description'] ? (
                    <CheckOutlined />
                  ) : (
                    <EditFilled />
                  )
                }
              />
            </Flex>
          </List.Item>
          <List.Item>
            <Flex vertical justify="center" gap="small">
              <Button type="primary">View in Taggit</Button>
              {project.deletable && (
                <Button danger onClick={() => setisDeleteModalOpen(true)}>
                  Delete map
                </Button>
              )}
            </Flex>
          </List.Item>
        </List>
      </Flex>
      <Modal
        title={`Edit ${currentField?.charAt(0).toUpperCase()}${currentField?.slice(1)}`}
        open={isEditModalOpen}
        onOk={onEditSubmit}
        onCancel={handleEditModalCancel}
        confirmLoading={isPending}
        footer={[
          <>
            <Button onClick={handleEditModalCancel}>Cancel</Button>
            <Button type="primary" loading={isPending} onClick={onEditSubmit}>
              Update
            </Button>
          </>,
        ]}
      >
        <Flex vertical justify="space-between">
          <h5>Enter updated {currentField}:</h5>
          <Input
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setValidationError(false);
            }}
          />
          {validationError && (
            <SectionMessage type="error">
              The {currentField} cannot be blank.
            </SectionMessage>
          )}
        </Flex>
      </Modal>
      <DeleteMapModal
        isOpen={isDeleteModalOpen}
        project={project}
        close={handleDeleteClose}
      />
    </>
  );
};

export default MapTabContent;
