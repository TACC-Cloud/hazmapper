import React, { useEffect, useCallback } from 'react';
import {
  Modal,
  Select,
  Layout,
  Flex,
  Form,
  Input,
  InputNumber,
  Button,
  ThemeConfig,
  ConfigProvider,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FormItem } from 'react-hook-form-antd';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePostTileServer } from '@hazmapper/hooks';
import { tileLayerSchema } from '../LayersPanel';
import { TileServerLayer } from '@hazmapper/types';
import { PrimaryButton } from '@hazmapper/common_components/Button';

const formTheme: ThemeConfig = {
  components: {
    Form: {
      itemMarginBottom: 14,
    },
    Input: {
      paddingBlock: 14,
    },
    InputNumber: {
      paddingBlock: 15,
    },
  },
};

const CreateLayerModal: React.FC<{
  isOpen: boolean;
  closeModal: () => void;
  projectId: number;
  addTileLayer: (layer: TileServerLayer) => void;
}> = ({ isOpen, closeModal, projectId, addTileLayer }) => {
  const {
    mutate: createTileLayer,
    data,
    isSuccess,
    reset: resetCreateTileLayer,
  } = usePostTileServer({ projectId });
  const { Content, Header } = Layout;
  const formSchema = z.object({
    importMethod: z.string(),
    tileLayer: tileLayerSchema.omit({ id: true, attribution: true }),
    attributionName: z.string().nullish(),
    attributionLink: z.string().url().nullish(),
  });
  type TFormSchema = z.infer<typeof formSchema>;

  const [form] = Form.useForm();

  const initialValues = {
    importMethod: 'suggestions',
    tileLayer: {
      name: '',
      type: 'tms',
      url: '',
      tileOptions: {
        maxZoom: null,
        minZoom: null,
        format: null,
        params: null,
        layers: null,
      },
      uiOptions: {
        opacity: 0.5,
        isActive: true,
        showDescription: false,
        showInput: false,
        zIndex: 0,
      },
    },
    attributionName: null,
    attributionLink: null,
  };

  const methods = useForm({
    defaultValues: initialValues,
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });
  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid },
    reset,
    watch,
  } = methods;

  const generateAttribution = (
    attributionName?: string | null,
    attributionLink?: string | null
  ) => {
    let copyright = '';

    if (attributionName) {
      copyright = '&copy; ';
      if (attributionLink) {
        copyright += '<a href="' + attributionLink + '">';
        copyright += attributionName + '</a>';
      } else {
        copyright += copyright + attributionName;
      }
    }

    return copyright;
  };

  const handleSubmitCallback = (data: TFormSchema) => {
    const submitData = {
      ...data.tileLayer,
      attribution: generateAttribution(
        data.attributionName,
        data.attributionLink
      ),
    };
    createTileLayer(submitData);
  };

  const handleClose = useCallback(() => {
    closeModal();
    reset();
  }, [reset, closeModal]);

  useEffect(() => {
    if (isSuccess && data) {
      addTileLayer(data);
      resetCreateTileLayer();
      handleClose();
    }
  }, [resetCreateTileLayer, addTileLayer, handleClose, isSuccess, data]);

  const defaultTileServers: ReadonlyArray<Omit<TileServerLayer, 'id'>> = [
    {
      name: 'Roads',
      type: 'tms',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      uiOptions: {
        opacity: 1,
        isActive: true,
        showDescription: false,
        showInput: false,
        zIndex: 0,
      },
      tileOptions: {
        minZoom: 0,
        maxZoom: 24,
        maxNativeZoom: 19,
      },
    },
    {
      name: 'Satellite',
      type: 'tms',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, \
      GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      uiOptions: {
        zIndex: 0,
        opacity: 1,
        isActive: true,
        showDescription: false,
        showInput: false,
      },
      tileOptions: {
        minZoom: 0,
        maxZoom: 24,
        maxNativeZoom: 19,
      },
    },
  ];

  return (
    <Modal
      title={<Header>Create a Tile Layer</Header>}
      open={isOpen}
      onCancel={handleClose}
      footer={[
        <Button key="closeModalButton" onClick={handleClose}>
          Cancel
        </Button>,
        <Button
          key="createLayerButton"
          form="createLayerForm"
          htmlType="submit"
          disabled={!isDirty || !isValid}
          type="primary"
          hidden={watch('importMethod') === 'suggestions'}
        >
          Create Layer
        </Button>,
      ]}
    >
      <Content>
        <ConfigProvider theme={formTheme}>
          <FormProvider {...methods}>
            <Form
              form={form}
              name="createLayerForm"
              onFinish={handleSubmit(handleSubmitCallback, console.error)}
              layout="vertical"
            >
              <FormItem
                control={control}
                name="importMethod"
                label="Import Method"
              >
                <Select
                  options={[
                    { value: 'suggestions', label: <span>Suggestions</span> },
                    { value: 'manual', label: <span>Manual</span> },
                    {
                      value: 'qms',
                      label: <span>QMS Search</span>,
                      disabled: true,
                    },
                  ]}
                />
              </FormItem>
              <Flex vertical style={{ marginTop: '3rem' }}>
                {watch('importMethod') === 'suggestions' && (
                  <>
                    {defaultTileServers.map((tileServer, index) => (
                      <Flex
                        key={`suggestedTile${index}`}
                        justify="space-between"
                        align="center"
                        style={{ marginBottom: '1.5rem' }}
                      >
                        <span>{tileServer.name}</span>
                        <PrimaryButton
                          onClick={() => createTileLayer(tileServer)}
                        >
                          <PlusOutlined />
                          Import
                        </PrimaryButton>
                      </Flex>
                    ))}
                  </>
                )}
                {watch('importMethod') === 'manual' && (
                  <>
                    <FormItem
                      control={control}
                      name="tileLayer.type"
                      label="Server Type"
                    >
                      <Select
                        options={[
                          { value: 'tms', label: <span>TMS</span> },
                          { value: 'wms', label: <span>WMS</span> },
                          { value: 'arcgis', label: <span>ArcGIS</span> },
                        ]}
                      />
                    </FormItem>
                    <FormItem
                      control={control}
                      name="tileLayer.name"
                      label="Name"
                    >
                      <Input />
                    </FormItem>
                    <FormItem
                      control={control}
                      name="tileLayer.url"
                      label="Tile Server URL"
                    >
                      <Input />
                    </FormItem>

                    {watch('tileLayer.type') !== 'arcgis' && (
                      <>
                        <Flex justify="space-between">
                          <FormItem
                            control={control}
                            name="attributionName"
                            label="Attribution"
                          >
                            <Input />
                          </FormItem>
                          <FormItem
                            control={control}
                            name="attributionLink"
                            label="Attribution Link"
                          >
                            <Input />
                          </FormItem>
                        </Flex>
                      </>
                    )}
                    {watch('tileLayer.type') === 'tms' && (
                      <>
                        <FormItem
                          control={control}
                          name="tileLayer.tileOptions.maxZoom"
                          label="Zoom Max"
                        >
                          <InputNumber />
                        </FormItem>
                        <FormItem
                          control={control}
                          name="tileLayer.tileOptions.minZoom"
                          label="Zoom Min"
                        >
                          <InputNumber />
                        </FormItem>
                      </>
                    )}
                    {watch('tileLayer.type') === 'wms' && (
                      <>
                        <FormItem
                          control={control}
                          name="tileLayer.tileOptions.layers"
                          label="Layers (comma-separated)"
                        >
                          <Input />
                        </FormItem>
                        <FormItem
                          control={control}
                          name="tileLayer.tileOptions.params"
                          label="Params"
                        >
                          <Input />
                        </FormItem>
                        <FormItem
                          control={control}
                          name="tileLayer.tileOptions.format"
                          label="Format"
                        >
                          <Select
                            options={[
                              { value: 'png', label: <span>.png</span> },
                              { value: 'jpeg', label: <span>.jpeg</span> },
                            ]}
                          />
                        </FormItem>
                      </>
                    )}
                  </>
                )}
              </Flex>
            </Form>
          </FormProvider>
        </ConfigProvider>
      </Content>
    </Modal>
  );
};

export default CreateLayerModal;
