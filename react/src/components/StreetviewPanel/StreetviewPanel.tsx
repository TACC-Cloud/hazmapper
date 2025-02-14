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
          We are currently upgrading Streetview to add necessary updates to our
          Mapillary integration. With these updates, you can expect a smoother
          experience when viewing sequences, publishing DesignSafe images to
          Mapillary, and importing Streetview assets directly onto onto your
          maps. Thank you for your patience.
        </Text>
      </Card>
    </ConfigProvider>
  );
};
export default StreetviewPanel;
