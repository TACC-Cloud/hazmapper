import React from 'react';
import { Layout } from 'antd';
import styles from './HeaderNavBar.module.css';

export const HeaderNavBar: React.FC<{ user: string }> = ({ user }) => {
  const { Header } = Layout;

  return (
    <Header className={styles.root}>
      <img
        width="150px"
        src="./src/assets/hazmapper-header-logo.png"
        alt="Hazmapper Logo"
      />
      <div className={styles.userName}>{user}</div>
    </Header>
  );
};
export default HeaderNavBar;
