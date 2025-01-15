import React from 'react';
import styles from './Panel.module.css';
import { Layout, Flex } from 'antd';

interface Props {
  title: string;
  children: React.ReactNode;
}

const Panel: React.FC<Props> = ({ title, children }) => {
  const { Header, Content } = Layout;

  return (
    <Flex vertical className={styles.root}>
      <Layout>
        <Header className={styles.header}>{title}</Header>
        <Content>{children}</Content>
      </Layout>
    </Flex>
  );
};

export default Panel;
