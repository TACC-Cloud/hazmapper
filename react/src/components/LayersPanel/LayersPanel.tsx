import React, { useState, useEffect, useMemo } from 'react';
import styles from './LayersPanel.module.css';
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
} from 'antd';
import {
  PlusOutlined,
  EyeFilled,
  EyeInvisibleOutlined,
  SlidersFilled,
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

const formLayerTheme: ThemeConfig = {
  components: {
    Form: {
      itemMarginBottom: 0,
    },
  },
};

const schema = z.object({
  tileLayers: z.array(
    z.object({
      layer: z.object({
        id: z.number(),
        name: z.string().min(1, 'Required'),
        type: z.string(),
        url: z.string(),
        attribution: z.string(),
        tileOptions: z.object({
          maxZoom: z.number().optional().nullish(),
          minZoom: z.number().optional().nullish(),
          maxNativeZoom: z.number().optional().nullish(),
          format: z.string().optional().nullish(),
          layers: z.string().optional().nullish(),
          params: z
            .object({
              format: z.string().optional().nullish(),
              layers: z.string(),
              request: z.string().optional().nullish(),
              service: z.string().optional().nullish(),
              styles: z.string().optional().nullish(),
              version: z.string().optional().nullish(),
              transpaernt: z.boolean().optional().nullish(),
              width: z.number().optional().nullish(),
              height: z.number().optional().nullish(),
            })
            .optional()
            .nullish(),
        }),
        uiOptions: z.object({
          zIndex: z.number(),
          opacity: z.number(),
          isActive: z.boolean(),
          showInput: z.boolean().optional().nullish(),
          showDescription: z.boolean().optional().nullish(),
        }),
      }),
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
}> = ({ tileLayers = [], projectId }) => {
  const [form] = Form.useForm();
  const { Header, Content } = Layout;
  const { mutate: updateTileLayers, isPending } = usePutTileServer({
    projectId,
  });
  const [editLayerField, setEditLayerField] = useState({});
  const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);

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
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid },
    reset,
    watch,
  } = methods;

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  useEffect(() => {
    if (isDirty && !saveButtonEnabled) setSaveButtonEnabled(true);
  }, [isDirty, saveButtonEnabled]);

  type TLayerOptionsFormData = {
    tileLayers: {
      layer: TileServerLayer;
    }[];
  };

  const saveLayerOptions = (data: TLayerOptionsFormData) => {
    const reOrderedLayers = data.tileLayers.map((item, index) => ({
      ...item.layer,
      uiOptions: {
        ...item.layer.uiOptions,
        zIndex: -(index + 1),
      },
    }));
    updateTileLayers(reOrderedLayers);
  };

  const { fields, move, update } = useFieldArray({
    control,
    name: 'tileLayers',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragDrop = (event) => {
    const { active, over } = event;
    if (active.id === over.id) return;
    const oldIndex = fields.findIndex((item) => item.id === active.id);
    const newIndex = fields.findIndex((item) => item.id === over.id);
    move(oldIndex, newIndex);
  };

  return (
    <Panel title="Layers">
      <div className={styles.root}>
        <Flex vertical>
          <Header style={{ fontSize: '1.6rem' }}>
            <Flex justify="space-between" align="center">
              Tile Layers
              <Button
                type="default"
                icon={<PlusOutlined />}
                title="Add Layer"
                size="middle"
              />
            </Flex>
          </Header>
          <Content>
            <ConfigProvider theme={formLayerTheme}>
              <FormProvider {...methods}>
                <Form
                  form={form}
                  style={{ maxWidth: 600 }}
                  className={styles.root}
                  layout="vertical"
                  onFinish={handleSubmit(saveLayerOptions, (error) => {
                    console.log('error submit data', error);
                  })}
                  onValuesChange={() => {
                    if (!saveButtonEnabled) setSaveButtonEnabled(true);
                  }}
                >
                  <fieldset disabled={isPending}>
                    <Flex vertical>
                      <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragDrop}
                        sensors={sensors}
                      >
                        <SortableContext
                          items={fields.map((field) => field.id)}
                        >
                          {fields.map((field, index) => {
                            const layerName = `tileLayers.${index}.layer.name`;
                            const layerOpacity: `tileLayers.${number}.layer.uiOptions.opacity` = `tileLayers.${index}.layer.uiOptions.opacity`;
                            return (
                              <SortableItem
                                key={field.id}
                                id={field.id}
                                disabled={
                                  editLayerField[layerName] ||
                                  editLayerField[layerOpacity] ||
                                  isPending
                                }
                              >
                                <Flex vertical>
                                  <Flex
                                    justify="space-between"
                                    align="center"
                                    className={styles.tileLayer}
                                  >
                                    <HolderOutlined
                                      style={{ cursor: 'move' }}
                                    />
                                    <Flex>
                                      <Button
                                        type="text"
                                        icon={
                                          field.layer.uiOptions.isActive ? (
                                            <EyeFilled />
                                          ) : (
                                            <EyeInvisibleOutlined />
                                          )
                                        }
                                        onClick={() => {
                                          update(index, {
                                            ...field,
                                            layer: {
                                              ...field.layer,
                                              uiOptions: {
                                                ...field.layer.uiOptions,
                                                isActive:
                                                  !field.layer.uiOptions
                                                    .isActive,
                                              },
                                            },
                                          });
                                        }}
                                      />
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
                                        <span>
                                          {truncateMiddle(
                                            watch(
                                              `tileLayers.${index}.layer.name`
                                            ),
                                            13
                                          )}
                                        </span>
                                      )}
                                    </Flex>
                                    <Flex>
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
                                        onClick={() =>
                                          setEditLayerField({
                                            ...editLayerField,
                                            [layerName]:
                                              !editLayerField[layerName],
                                          })
                                        }
                                      />
                                      <Button
                                        type="text"
                                        icon={<SlidersFilled />}
                                        title="Adjust Opacity"
                                        size="small"
                                        onClick={() => {
                                          update(index, {
                                            ...field,
                                            layer: {
                                              ...field.layer,
                                              uiOptions: {
                                                ...field.layer.uiOptions,
                                                showDescription:
                                                  !field.layer.uiOptions
                                                    .showDescription,
                                              },
                                            },
                                          });
                                        }}
                                      />
                                      <DeleteTileLayerButton
                                        projectId={projectId}
                                        tileLayerId={field.layer.id}
                                      />
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

                    {saveButtonEnabled && (
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
      </div>
    </Panel>
  );
};

export default LayersPanel;
