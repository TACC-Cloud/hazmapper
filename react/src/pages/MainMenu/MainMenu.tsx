import React from 'react';
import { LoadingSpinner, InlineMessage } from '@tacc/core-components';
import useAuthenticatedUser from '@hazmapper/hooks/user/useAuthenticatedUser';
import ProjectListing from '@hazmapper/components/Projects/ProjectListing';
import styles from './layout.module.css';
import HeaderNavBar from '@hazmapper/components/HeaderNavBar';

const MainMenu = () => {
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useAuthenticatedUser();

  if (isUserLoading) {
    return (
      <>
        <HeaderNavBar user={''} />
        <LoadingSpinner />
      </>
    );
  }
  if (userError) {
    return (
      <>
        <HeaderNavBar user={''} />
        <InlineMessage type="error">Unable to retrieve projects.</InlineMessage>
      </>
    );
  }

  return (
    <div className={styles.root}>
      <HeaderNavBar user={userData.username} />
      <div className={styles.listingContainer}>
        <ProjectListing />
      </div>
      <div className={styles.sponsorContainer}>
        <a href="https://www.nsf.gov/">
          <img
            src="./src/assets/nsf.png"
            alt="National Science Foundation website"
            width="60px"
          />
        </a>
        <a href="https://www.designsafe-ci.org/">
          <img
            src="./src/assets/designsafe.svg"
            alt="NHERI DesignSafe website"
            width="200px"
          />
        </a>
        <a href="https://www.designsafe-ci.org/about/">
          <img src="./src/assets/nheri.png" alt="NHERI website" width="150px" />
        </a>
      </div>
    </div>
  );
};

export default MainMenu;
