import React, { useState, useEffect, useMemo } from 'react';
import Panel from '@hazmapper/components/Panel';
import {
  Layout,
  Flex,
  Button,
  Form,
  Input,
  ConfigProvider,
  ThemeConfig,
  Slider,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EyeFilled,
  EyeInvisibleOutlined,
  SlidersFilled,
  SlidersOutlined,
  EditFilled,
  CloseOutlined,
  CheckOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import { FormItem } from 'react-hook-form-antd';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { TileServerLayer } from '@hazmapper/types';
import { truncateMiddle } from '@hazmapper/utils/truncateMiddle';
import {
  usePutTileServer,
  useDeleteTileServer,
  UseDeleteTileServerParams,
} from '@hazmapper/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SortableItem } from './SortableItem';
import { useSelector } from 'react-redux';
import { RootState } from '@hazmapper/redux/store';
import { isTokenValid } from '@hazmapper/utils/authUtils';
import CreateLayerModal from '../CreateLayerModal';

const formLayerTheme: ThemeConfig = {
  components: {
    Form: {
      itemMarginBottom: 0,
    },
  },
};

export const tileLayerSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Required'),
  type: z.string(),
  url: z.string().url().min(1, 'Required'),
  attribution: z.string(),
  tileOptions: z.object({
    maxZoom: z.number().nullish(),
    minZoom: z.number().nullish(),
    maxNativeZoom: z.number().nullish(),
    format: z.string().nullish(),
    layers: z.string().nullish(),
  }),
  uiOptions: z.object({
    zIndex: z.number(),
    opacity: z.number(),
    isActive: z.boolean(),
    showInput: z.boolean().nullish(),
    showDescription: z.boolean().nullish(),
  }),
});

const formSchema = z.object({
  tileLayers: z.array(
    z.object({
      layer: tileLayerSchema, // Need to nest tile layer here since useFieldArray will add it's own `id` field, overwriting our own
    })
  ),
});

export const DeleteTileLayerButton: React.FC<UseDeleteTileServerParams> = ({
  projectId,
  tileLayerId,
}) => {
  const {
    mutate: deleteTileLayer,
    isPending,
    isSuccess,
  } = useDeleteTileServer({ projectId, tileLayerId });
  return (
    <Button
      type="text"
      icon={<CloseOutlined />}
      title="Delete Layer"
      size="small"
      onClick={() => deleteTileLayer()}
      loading={isPending}
      disabled={isPending || isSuccess}
    />
  );
};

const LayersPanel: React.FC<{
  tileLayers?: TileServerLayer[];
  projectId: number;
  isPublicView: boolean;
}> = ({ tileLayers = [], projectId, isPublicView }) => {
  const isAuthenticated = useSelector((state: RootState) =>
    isTokenValid(state.auth.authToken)
  );
  const canSaveForm = isAuthenticated && !isPublicView;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { Header, Content } = Layout;
  const { mutate: updateTileLayers, isPending } = usePutTileServer({
    projectId,
  });
  const [editLayerField, setEditLayerField] = useState({});

  const initialValues = useMemo(
    () => ({
      tileLayers: tileLayers
        .sort((a, b) => b.uiOptions.zIndex - a.uiOptions.zIndex)
        .map((layer) => ({ layer })),
    }),
    [tileLayers]
  );

  const methods = useForm({
    defaultValues: initialValues,
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid },
    watch,
    getFieldState,
    setValue,
    getValues,
  } = methods;

  type TLayerOptionsFormData = {
    tileLayers: {
      layer: TileServerLayer;
    }[];
  };

  const reorderLayers = (data: TLayerOptionsFormData) =>
    data.tileLayers.map((item, index) => ({
      ...item.layer,
      uiOptions: {
        ...item.layer.uiOptions,
        zIndex: -(index + 1),
      },
    }));

  const { fields, move, insert } = useFieldArray({
    control,
    name: 'tileLayers',
  });

  const addTileLayer = (layer: TileServerLayer) => {
    insert(0, { layer });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const [canDrag, setCanDrag] = useState(false);

  const handleDragDrop = (event) => {
    const { active, over } = event;
    if (active.id === over.id) return;
    const oldIndex = fields.findIndex((item) => item.id === active.id);
    const newIndex = fields.findIndex((item) => item.id === over.id);
    move(oldIndex, newIndex);
  };

  return (
    <Panel title="Layers">
      <Flex vertical>
        <Header style={{ fontSize: '1.6rem' }}>
          <Flex justify="space-between" align="center">
            Tile Layers
            {canSaveForm && (
              <Button
                type="default"
                icon={<PlusOutlined />}
                title="Add Layer"
                size="middle"
                onClick={() => setIsModalOpen(true)}
              />
            )}
          </Flex>
        </Header>
        <Content>
          <ConfigProvider theme={formLayerTheme}>
            <FormProvider {...methods}>
              <Form
                form={form}
                style={{ maxWidth: 600 }}
                layout="vertical"
                onFinish={handleSubmit(
                  (data) => updateTileLayers(reorderLayers(data)),
                  (error) => {
                    console.log('error submit data', error);
                  }
                )}
              >
                <fieldset disabled={isPending}>
                  <Flex vertical>
                    <DndContext
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragDrop}
                      sensors={sensors}
                    >
                      <SortableContext items={fields.map((field) => field.id)}>
                        {fields.map((field, index) => {
                          const layerName: `tileLayers.${number}.layer.name` = `tileLayers.${index}.layer.name`;
                          const layerOpacity: `tileLayers.${number}.layer.uiOptions.opacity` = `tileLayers.${index}.layer.uiOptions.opacity`;
                          return (
                            <SortableItem
                              key={field.id}
                              id={field.id}
                              disabled={!canDrag || isPending}
                            >
                              <Flex vertical>
                                <Flex justify="space-between" align="center">
                                  <HolderOutlined
                                    id={`holder-${field.id}`}
                                    style={{ cursor: 'move' }}
                                    onMouseEnter={() => setCanDrag(true)}
                                    onMouseLeave={() => setCanDrag(false)}
                                  />
                                  <Flex>
                                    <FormItem
                                      control={control}
                                      name={`tileLayers.${index}.layer.uiOptions.isActive`}
                                    >
                                      <Tag.CheckableTag
                                        style={{
                                          marginRight: 0,
                                          width: 24,
                                          height: 24,
                                        }}
                                        checked={watch(
                                          `tileLayers.${index}.layer.uiOptions.isActive`
                                        )}
                                        onChange={() => {
                                          setValue(
                                            `tileLayers.${index}.layer.uiOptions.isActive`,
                                            !getValues(
                                              `tileLayers.${index}.layer.uiOptions.isActive`
                                            )
                                          );
                                        }}
                                      >
                                        <Flex
                                          align="center"
                                          justify="center"
                                          style={{ height: '100%' }}
                                        >
                                          {watch(
                                            `tileLayers.${index}.layer.uiOptions.isActive`
                                          ) ? (
                                            <EyeFilled />
                                          ) : (
                                            <EyeInvisibleOutlined />
                                          )}
                                        </Flex>
                                      </Tag.CheckableTag>
                                    </FormItem>
                                  </Flex>
                                  <Flex
                                    style={{
                                      width: '100%',
                                      padding: '0 5px',
                                    }}
                                  >
                                    {editLayerField[layerName] ? (
                                      <FormItem
                                        control={control}
                                        name={`tileLayers.${index}.layer.name`}
                                      >
                                        <Input style={{ paddingLeft: '0' }} />
                                      </FormItem>
                                    ) : (
                                      <span
                                        title={watch(
                                          `tileLayers.${index}.layer.name`
                                        )}
                                      >
                                        {truncateMiddle(
                                          watch(
                                            `tileLayers.${index}.layer.name`
                                          ),
                                          13
                                        )}
                                      </span>
                                    )}
                                  </Flex>
                                  <Flex align="center">
                                    <Button
                                      type="text"
                                      icon={
                                        editLayerField[layerName] ? (
                                          <CheckOutlined />
                                        ) : (
                                          <EditFilled />
                                        )
                                      }
                                      title="Rename Layer"
                                      size="small"
                                      disabled={
                                        editLayerField[layerName] &&
                                        getFieldState(layerName).invalid
                                      }
                                      onClick={() =>
                                        setEditLayerField({
                                          ...editLayerField,
                                          [layerName]:
                                            !editLayerField[layerName],
                                        })
                                      }
                                    />
                                    <FormItem
                                      control={control}
                                      name={`tileLayers.${index}.layer.uiOptions.showDescription`}
                                    >
                                      <Tag.CheckableTag
                                        style={{
                                          marginRight: 0,
                                          width: 24,
                                          height: 24,
                                        }}
                                        checked={
                                          !!watch(
                                            `tileLayers.${index}.layer.uiOptions.showDescription`
                                          )
                                        }
                                        onChange={() => {
                                          setValue(
                                            `tileLayers.${index}.layer.uiOptions.showDescription`,
                                            !getValues(
                                              `tileLayers.${index}.layer.uiOptions.showDescription`
                                            )
                                          );
                                        }}
                                      >
                                        <Flex
                                          align="center"
                                          justify="center"
                                          style={{ height: '100%' }}
                                        >
                                          {watch(
                                            `tileLayers.${index}.layer.uiOptions.showDescription`
                                          ) ? (
                                            <SlidersFilled />
                                          ) : (
                                            <SlidersOutlined />
                                          )}
                                        </Flex>
                                      </Tag.CheckableTag>
                                    </FormItem>
                                    {canSaveForm && (
                                      <DeleteTileLayerButton
                                        projectId={projectId}
                                        tileLayerId={field.layer.id}
                                      />
                                    )}
                                  </Flex>
                                </Flex>
                                <FormItem
                                  control={control}
                                  name={layerOpacity}
                                  style={{
                                    width: '100%',
                                    padding: '0 5px',
                                  }}
                                >
                                  {watch(
                                    `tileLayers.${index}.layer.uiOptions.showDescription`
                                  ) && <Slider min={0} max={1} step={0.1} />}
                                </FormItem>
                              </Flex>
                            </SortableItem>
                          );
                        })}
                      </SortableContext>
                    </DndContext>
                  </Flex>
                  {isDirty && canSaveForm && (
                    <Flex
                      align="center"
                      justify="center"
                      style={{ marginTop: '5rem' }}
                      vertical
                    >
                      <span
                        style={{ textAlign: 'center', paddingBottom: '1rem' }}
                      >
                        Layer options have changed!
                        <br /> Save to persist changes.
                      </span>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          disabled={!isValid}
                          loading={isPending}
                        >
                          Save Layer Options
                        </Button>
                      </Form.Item>
                    </Flex>
                  )}
                </fieldset>
              </Form>
            </FormProvider>
          </ConfigProvider>
        </Content>
      </Flex>
      <CreateLayerModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        projectId={projectId}
        addTileLayer={addTileLayer}
      />
    </Panel>
  );
};

export default LayersPanel;
