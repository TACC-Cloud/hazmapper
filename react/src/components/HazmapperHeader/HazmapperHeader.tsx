import React from 'react';
import useAuthenticatedUser from '@hazmapper/hooks/user/useAuthenticatedUser';
import { AuthenticatedUser } from '@hazmapper/types';
import { Layout } from 'antd';
import styles from './HazmapperHeader.module.css';

export const HazmapperHeader: React.FC<{ user: string }> = ({ user }) => {
  const { Header } = Layout;

  return (
    <Header className={styles.root}>
      <img width="150px" src="./src/assets/hazmapper-header-logo.png" />
      <div className={styles.userName}>{user}</div>
    </Header>
  );
};
export default HazmapperHeader;
