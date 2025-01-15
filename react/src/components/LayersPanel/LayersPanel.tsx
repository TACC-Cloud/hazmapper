import React from 'react';
import styles from './LayersPanel.module.css';
import Panel from '@hazmapper/components/Panel';
import { Layout, Flex, Button } from 'antd';
import {
  PlusOutlined,
  EyeFilled,
  EyeInvisibleOutlined,
  SlidersFilled,
  EditFilled,
  CloseOutlined,
} from '@ant-design/icons';
import { PrimaryButton } from '@hazmapper/common_components';
import { TileServerLayer } from '@hazmapper/types';
import { truncateMiddle } from '@hazmapper/utils/truncateMiddle';
import {
  usePostTileServer,
  usePutTileServer,
  useDeleteTileServer,
  UseDeleteTileServerParams,
} from '@hazmapper/hooks';

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
  const { Header, Content } = Layout;
  const { mutate: updateTileLayers, isPending } = usePutTileServer({
    projectId,
  });
  return (
    <Panel title="Layers">
      <div className={styles.root}>
        <Flex vertical>
          <Header style={{ fontSize: '1.6rem' }}>
            <Flex justify="space-between" align="center">
              Tile Layers
              <PrimaryButton icon={<PlusOutlined />} title="Add Layer" />
            </Flex>
          </Header>
          <Content>
            <div className={styles.root}>
              {tileLayers
                .sort((a, b) => b.uiOptions.zIndex - a.uiOptions.zIndex)
                .map((layer) => (
                  <Flex
                    key={layer.id}
                    justify="space-between"
                    align="center"
                    className={styles.tileLayer}
                  >
                    <span>
                      {layer.uiOptions.isActive ? (
                        <Button type="text" icon={<EyeFilled />} />
                      ) : (
                        <Button type="text" icon={<EyeInvisibleOutlined />} />
                      )}
                      <span title={layer.name}>
                        {truncateMiddle(layer.name, 15)}
                      </span>
                    </span>
                    <Flex>
                      <Button
                        type="text"
                        icon={<EditFilled />}
                        title="Rename Layer"
                        size="small"
                      />
                      <Button
                        type="text"
                        icon={<SlidersFilled />}
                        title="Adjust Opacity"
                        size="small"
                      />
                      <DeleteTileLayerButton
                        projectId={projectId}
                        tileLayerId={layer.id}
                      />
                    </Flex>
                  </Flex>
                ))}
            </div>
          </Content>
        </Flex>
      </div>
    </Panel>
  );
};

export default LayersPanel;
