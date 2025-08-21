import React, { useState, useEffect } from 'react';
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
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { TileServerLayer, TLayerOptionsFormData } from '@hazmapper/types';
import { truncateMiddle } from '@hazmapper/utils/truncateMiddle';
import {
  usePutTileServer,
  useDeleteTileServer,
  UseDeleteTileServerParams,
  useAuthenticatedUser,
} from '@hazmapper/hooks';
import { SortableItem } from './SortableItem';
import CreateLayerModal from '../CreateLayerModal';

const formLayerTheme: ThemeConfig = {
  components: {
    Form: {
      itemMarginBottom: 0,
    },
  },
};

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
  projectId: number;
  isPublicView: boolean;
}> = ({ projectId, isPublicView }) => {
  const {
    data: { isAuthenticated },
  } = useAuthenticatedUser();
  const canSaveForm = isAuthenticated && !isPublicView;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { Header, Content } = Layout;
  const { mutate: updateTileLayers, isPending } = usePutTileServer({
    projectId,
  });
  const [editLayerField, setEditLayerField] = useState({});

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid, defaultValues },
    watch,
    getFieldState,
    setValue,
    getValues,
    reset,
  } = useFormContext<TLayerOptionsFormData>();

  useEffect(() => {
    setEditLayerField({});
  }, [defaultValues]);

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
    reset(getValues());
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
    fields.forEach((_, index) => {
      setValue(`tileLayers.${index}.layer.uiOptions.zIndex`, -(index + 1));
    });
  };

  return (
    <>
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
                                        watch(`tileLayers.${index}.layer.name`),
                                        13
                                      )}
                                    </span>
                                  )}
                                </Flex>
                                <Flex align="center">
                                  {!isPublicView && (
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
                                  )}
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
                                          <SlidersFilled title="Hide Opacity" />
                                        ) : (
                                          <SlidersOutlined title="Show Opacity" />
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
          </ConfigProvider>
        </Content>
      </Flex>
      <CreateLayerModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        projectId={projectId}
        addTileLayer={addTileLayer}
      />
    </>
  );
};

export default LayersPanel;
