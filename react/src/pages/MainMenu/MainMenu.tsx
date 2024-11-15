import React, { useState } from 'react';
import {
  LoadingSpinner,
  InlineMessage,
  SectionHeader,
  Button,
} from '@tacc/core-components';
import useAuthenticatedUser from '@hazmapper/hooks/user/useAuthenticatedUser';
import ProjectListing from '@hazmapper/components/Projects/ProjectListing';
import { Layout } from 'antd';
import styles from './layout.module.css';

const MainMenu = () => {
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

  const headerStyle = {
    alignItems: 'center',
    justifyContent: 'space-between',
    display: 'flex',
  };

  const contentStyle = {
    alignContent: 'center',
  };

  return (
    <div className={styles.root}>
      <Layout.Header style={headerStyle}>
        <img width="150px" src="./assets/hazmapper-header-logo.png" />
        <div className={styles.userName}>{userData.username}</div>
      </Layout.Header>
      <Layout.Content>
        <div className={styles.versionContainer}>
          <img src="./assets/Hazmapper-Stack@4x.png"></img>
          <div className={styles.version}>{'Version 2.17'}</div>
        </div>
        <ProjectListing />
        <Button
          iconNameBefore="exit"
          type="link"
          onClick={() =>
            (window.location.href =
              'https://www.designsafe-ci.org/user-guide/tools/visualization/#hazmapper-user-guide')
          }
        >
          User Guide
        </Button>
      </Layout.Content>
      <Layout.Footer>
        <div className={styles.logoContainer}>
          <a href="https://www.nsf.gov/">
            <img src="./assets/nsf.png" width="60px" />
          </a>
          <a href="https://www.designsafe-ci.org/">
            <img src="./assets/designsafe.svg" width="200px" />
          </a>
          <a href="https://www.designsafe-ci.org/about/">
            <img src="./assets/nheri.png" width="150px" />
          </a>
        </div>
      </Layout.Footer>
    </div>
  );
};

export default MainMenu;
