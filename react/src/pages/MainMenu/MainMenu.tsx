import React, { useState } from 'react';
import {
  LoadingSpinner,
  InlineMessage,
  SectionHeader,
} from '@tacc/core-components';
import useAuthenticatedUser from '@hazmapper/hooks/user/useAuthenticatedUser';
import ProjectListing from '@hazmapper/components/Projects/ProjectListing';
import { Layout } from 'antd';
import styles from './layout.module.css';

const MainMenu = () => {
  const { Header, Content, Footer } = Layout;
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useAuthenticatedUser();

  const [selectedSystem, setSelectedSystem] = useState('');

  if (isUserLoading) {
    return (
      <>
        <SectionHeader isNestedHeader>Main Menu</SectionHeader>
        <LoadingSpinner />
      </>
    );
  }
  if (userError) {
    <>
      <SectionHeader isNestedHeader>Main Menu</SectionHeader>
      <InlineMessage type="error">Unable to retrieve projects.</InlineMessage>
    </>;
  }

  const handleSelectChange = (system: string) => {
    setSelectedSystem(system);
  };

  return (
    <Layout className={styles.root}>
      <Header className={styles.mainMenuHeader}>
        <img width="150px" src="./src/assets/hazmapper-header-logo.png" />
        <div className={styles.userName}>{userData.username}</div>
      </Header>
      <Content className={styles.listingContainer}>
        <ProjectListing />
      </Content>
      <Footer className={styles.menuFooter}>
        <div className={styles.sponsorContainer}>
          <a href="https://www.nsf.gov/">
            <img src="./src/assets/nsf.png" width="60px" />
          </a>
          <a href="https://www.designsafe-ci.org/">
            <img src="./src/assets/designsafe.svg" width="200px" />
          </a>
          <a href="https://www.designsafe-ci.org/about/">
            <img src="./src/assets/nheri.png" width="150px" />
          </a>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainMenu;
