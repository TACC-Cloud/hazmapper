import React from 'react';
import styles from './Panel.module.css';
import { Layout, Flex, LayoutProps } from 'antd';

const Panel: React.FC<LayoutProps & { panelTitle: string }> = ({
  panelTitle,
  children,
  ...props
}) => {
  const { Header, Content } = Layout;

  return (
    <Layout {...props}>
      <Flex vertical className={styles.root}>
        <Header className={styles.header}>{panelTitle}</Header>
        <Content>{children}</Content>
      </Flex>
    </Layout>
  );
};

export default Panel;
