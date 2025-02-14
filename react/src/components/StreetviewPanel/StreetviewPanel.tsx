import React from 'react';
import { ToolOutlined } from '@ant-design/icons';
import { Card, ConfigProvider, ThemeConfig, Flex, Typography } from 'antd';

const streetviewTheme: ThemeConfig = {
  components: {
    Card: {
      headerBg: 'var(--global-color-success--light)',
      bodyPadding: 8,
      headerPadding: 8,
    },
  },
};

const StreetviewPanel: React.FC = () => {
  const { Text } = Typography;
  return (
    <ConfigProvider theme={streetviewTheme}>
      <Card
        style={{
          margin: 10,
        }}
        title={
          <Flex align="center" justify="left" style={{ textWrap: 'wrap' }}>
            <div style={{ marginRight: 5 }}>
              <ToolOutlined />
            </div>
            <div>Streetview Upgrades Coming Soon!</div>
          </Flex>
        }
      >
        <Text>
          We are upgrading our Mapillary integration to make it even better!
          Soon, we will have a smoother experience when viewing sequences,
          publishing DesignSafe images to Mapillary, and importing Streetview
          assets directly onto onto your maps. Stay tuned as we polish up these
          improvements!
        </Text>
      </Card>
    </ConfigProvider>
  );
};
export default StreetviewPanel;
