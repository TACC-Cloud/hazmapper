import React from 'react';
import { Modal, Typography, Form, Input, Button, Space } from 'antd';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { useCreatePointCloud } from '@hazmapper/hooks';

const { Text } = Typography;
const { TextArea } = Input;

interface PointCloudInfoModalProps {
  projectId: number;
  onClose: () => void;
}

interface FormValues {
  description: string;
  conversion_parameters?: string;
}

const PointCloudCreateModal: React.FC<PointCloudInfoModalProps> = ({
  projectId,
  onClose,
}) => {
  const methods = useForm<FormValues>(); // Initialize react-hook-form
  const { handleSubmit, control, formState } = methods;
  const { mutate: createPointCloud } = useCreatePointCloud({ projectId });

  const onSubmit = (data: FormValues) => {
    // Trim whitespace from inputs
    const trimmedValues = {
      description: data.description.trim(),
      conversion_parameters: data.conversion_parameters?.trim() || '',
    };

    createPointCloud(trimmedValues);
    onClose();
  };

  return (
    <Modal
      title="Create a Point Cloud"
      open
      onCancel={onClose}
      footer={null}
      width={600}
      zIndex={2000}
    >
      <div style={{ marginBottom: 16 }}>
        <Text>
          Point cloud data files (e.g. las/laz files) can be added to a map
          asset. Point cloud data files added to a point cloud are processed
          using Potree Converter and a corresponding asset on the map can be
          viewed.
        </Text>
      </div>

      <FormProvider {...methods}>
        <Form layout="vertical" requiredMark={false}>
          <Controller
            name="description"
            control={control}
            rules={{ required: 'Please enter a description' }} // Validation rule
            render={({ field, fieldState }) => (
              <Form.Item
                label="Description"
                validateStatus={fieldState.error ? 'error' : ''} // Set error state
                help={fieldState.error?.message} // Display error message
              >
                <TextArea {...field} rows={1} />
              </Form.Item>
            )}
          />

          <Controller
            name="conversion_parameters"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="Additional Conversion Parameters"
                extra={
                  <Text type="secondary">
                    These will be added to the parameters passed to Potree
                    Converter. By default, the only parameters passed are
                    `--generate-page index.html`
                  </Text>
                }
              >
                <TextArea {...field} rows={2} />
              </Form.Item>
            )}
          />

          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={onClose}>Close</Button>
              <Button
                type="primary"
                onClick={handleSubmit(onSubmit)}
                disabled={!formState.isValid}
              >
                Submit
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </FormProvider>
    </Modal>
  );
};

export default PointCloudCreateModal;
