import React, { useEffect, useState, useRef } from 'react';
import { FormItem } from 'react-hook-form-antd';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Input,
  Checkbox,
  Splitter,
  Modal,
  Layout,
  Flex,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuthenticatedUser, useCreateProject } from '@hazmapper/hooks';
import { ProjectRequest } from '@hazmapper/types';
import { FileListing } from '@hazmapper/components/Files';
import { truncateMiddle } from '@hazmapper/utils/truncateMiddle';
import { renderFilePathLabel } from '@hazmapper/utils/fileUtils';
import styles from './CreateMapModal.module.css';

type CreateMapModalProps = {
  isOpen: boolean;
  closeModal: () => void;
};

const validationSchema = z.object({
  name: z.string().nonempty('Name is required'),
  description: z.string().nonempty('Description is required'),
  systemFile: z
    .string()
    .regex(
      /^[A-Za-z0-9-_.]+$/,
      'Only letters, numbers, hyphens, underscores, and periods are allowed'
    )
    .nonempty('File name is required'),
});

const CreateMapModal = ({ isOpen, closeModal }: CreateMapModalProps) => {
  const [form] = Form.useForm();
  const methods = useForm({
    defaultValues: {
      name: '',
      description: '',
      systemFile: '',
      systemId: 'designsafe.storage.default',
      systemPath: '',
      syncFolder: false,
      saveLocationDisplay: 'My Data',
    },
    resolver: zodResolver(validationSchema),
    mode: 'onChange',
  });
  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid },
    reset,
    watch,
    setValue,
    trigger,
    getValues,
  } = methods;

  const [errorMessage, setErrorMessage] = useState('');
  const { data: userData } = useAuthenticatedUser();
  const { mutate: createProject, isPending: isCreatingProject } =
    useCreateProject();
  const navigate = useNavigate();
  const oldSystemFilename = useRef('');

  const mapName = watch('name');

  const { Header } = Layout;

  useEffect(() => {
    // Replace spaces with underscores for systemFile mirroring
    const systemFilename = mapName.replace(/\s+/g, '_');

    // Fetch the previous system file name via ref
    const oldName = oldSystemFilename.current;

    // Update systemFile only if it matches the previous name and if name/systemFile are different
    const systemFile = getValues('systemFile');
    if (systemFile === oldName && systemFile !== systemFilename) {
      setValue('systemFile', systemFilename);
      trigger('systemFile');
      oldSystemFilename.current = systemFilename;
    }
  }, [getValues, mapName, setValue]);

  const handleClose = () => {
    setErrorMessage('');
    closeModal();
    reset();
    oldSystemFilename.current = '';
  };

  const handleDirectoryChange = (directory: string) => {
    const systemId = getValues('systemId');
    const saveLocationDisplay = renderFilePathLabel(
      directory,
      userData?.username || '',
      systemId
    );
    setValue('saveLocationDisplay', saveLocationDisplay);
    setValue('systemPath', directory);
  };

  const handleSystemChange = (system: string) => {
    setValue('systemId', system);
  };

  const handleCreateProject = (projectData: ProjectRequest) => {
    createProject(projectData, {
      onSuccess: (newProject) => {
        navigate(`/project/${newProject.uuid}`);
      },
      onError: (err) => {
        // Handle error messages while creating new project
        if (err?.response?.status === 409) {
          setErrorMessage(
            'This folder is already synced with a different map.'
          );
        } else {
          setErrorMessage(
            'An error occurred while creating the project. Please contact support.'
          );
        }
      },
    });
  };

  const handleSubmitCallback = () => {
    if (!userData) {
      setErrorMessage('User information is not available');
      return;
    }
    const values = getValues();
    const projectData: ProjectRequest = {
      name: values.name,
      description: values.description,
      system_file: values.systemFile,
      system_id: values.systemId,
      system_path: values.systemPath,
      watch_content: values.syncFolder,
      watch_users: values.syncFolder,
    };
    handleCreateProject(projectData);
  };

  return (
    <Modal
      title={<Header>Create a New Map</Header>}
      width={1200}
      open={isOpen}
      onCancel={handleClose}
      footer={[
        <Flex key="footerButtons">
          <Button onClick={handleClose} style={{ marginRight: 10 }}>
            Cancel
          </Button>
          <Button
            form="createMapForm"
            htmlType="submit"
            loading={isCreatingProject}
            disabled={!isDirty || !isValid}
            type="primary"
            name="Create Map"
          >
            Create Map
          </Button>
        </Flex>,
      ]}
    >
      <Splitter style={{ minHeight: '50vh' }}>
        <Splitter.Panel style={{ padding: 10 }} resizable={false}>
          <Form
            form={form}
            name="createMapForm"
            onFinish={handleSubmit(handleSubmitCallback, console.error)}
            layout="vertical"
            className={`${styles['formRoot']}`}
          >
            <FormItem control={control} name="name" label="Name" required>
              <Input data-testid="name-input" />
            </FormItem>
            <FormItem
              control={control}
              name="description"
              label="Description"
              required
            >
              <Input.TextArea data-testid="description" />
            </FormItem>
            <FormItem
              control={control}
              name="systemFile"
              label="Custom File Name"
              required
            >
              <Input
                data-testid="custom-file-name"
                addonAfter={
                  <span className={`${styles['hazmapper-suffix']}`}>
                    .hazmapper
                  </span>
                }
              />
            </FormItem>
            <FormItem
              control={control}
              name="saveLocationDisplay"
              label="Save Location"
            >
              <span title={watch('saveLocationDisplay')}>
                {truncateMiddle(watch('saveLocationDisplay'), 78)}
              </span>
            </FormItem>
            <FormItem
              control={control}
              name="syncFolder"
              label="Sync Folder"
              className={`${styles['checkboxWrapper']}`}
            >
              <Flex align="center">
                <Checkbox />
                <span style={{ marginLeft: 15 }}>
                  When enabled, files in this folder are synced into the map
                  periodically.
                </span>
              </Flex>
            </FormItem>
            {errorMessage && (
              <div className="c-form__errors">{errorMessage}</div>
            )}
          </Form>
        </Splitter.Panel>

        <Splitter.Panel resizable={false} style={{ padding: 10 }}>
          <Flex vertical style={{ height: '100%' }}>
            <h2 className={`${styles['link-heading']}`}>
              Select Link Save Location
            </h2>
            <h4 className={`${styles['link-subheading']}`}>
              If no folder is selected, the link file will be saved to the root
              of the selected system.If you select a project, you can link the
              current map to the project.
            </h4>
            <FileListing
              disableSelection={false}
              onFolderSelect={handleDirectoryChange}
              showPublicSystems={false}
              onSystemSelect={handleSystemChange}
            />
          </Flex>
        </Splitter.Panel>
      </Splitter>
    </Modal>
  );
};

export default CreateMapModal;
