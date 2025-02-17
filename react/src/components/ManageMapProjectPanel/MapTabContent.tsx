import React, { useState } from 'react';
import { Project, ProjectRequest } from '@hazmapper/types';
import { SectionMessage } from '@tacc/core-components';
import { EditFilled, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Flex, List, Input, Modal } from 'antd';
import { useAppConfiguration } from '@hazmapper/hooks';
import DeleteMapModal from '../DeleteMapModal/DeleteMapModal';

interface MapTabProps {
  project: Project;
  onProjectUpdate: (updateData: Partial<ProjectRequest>) => void;
  isPending: boolean;
}

const MapTabContent: React.FC<MapTabProps> = ({
  project,
  onProjectUpdate,
  isPending,
}) => {
  const [editProjectField, setEditProjectField] = useState({});
  const [isEditModalOpen, setisEditModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState<
    'name' | 'description' | null
  >(null);
  const [editValue, setEditValue] = useState('');
  const [validationError, setValidationError] = useState(false);

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

    onProjectUpdate({ [currentField]: editValue });
    setisEditModalOpen(false);
    setCurrentField(null);
    setEditProjectField({});
  };

  const handleEditModalCancel = () => {
    setisEditModalOpen(false);
    setValidationError(false);
    setCurrentField(null);
    setEditProjectField({});
  };

  //Deleting map
  const [isDeleteModalOpen, setisDeleteModalOpen] = useState(false);
  const handleDeleteClose = () => {
    setisDeleteModalOpen(false);
  };

  const config = useAppConfiguration();

  return (
    <>
      {!isPublicView ? (
        <>
          <Flex vertical justify="center">
            <List
              itemLayout="vertical"
              style={{ marginLeft: 20, marginRight: 20 }}
            >
              <List.Item>
                <List.Item.Meta title={'Name:'} style={{ marginBottom: 0 }} />
                <Flex justify="space-between">
                  {project.name}
                  <Button
                    onClick={() => handleEditClick('name')}
                    type="text"
                    icon={
                      editProjectField['name'] ? (
                        <CheckOutlined />
                      ) : (
                        <EditFilled />
                      )
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
                  <Button
                    type="primary"
                    // TODO Improve navigating to taggit https://tacc-main.atlassian.net/browse/WG-430)
                    href={config.taggitUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View in Taggit
                  </Button>
                  {project.deletable && (
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => setisDeleteModalOpen(true)}
                    >
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
                <Button
                  type="primary"
                  loading={isPending}
                  onClick={onEditSubmit}
                >
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
      ) : (
        <>
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
        </>
      )}
    </>
  );
};

export default MapTabContent;
