import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { notification } from 'antd';
import ProjectListing from '@hazmapper/components/Projects/ProjectListing';
import styles from './layout.module.css';
import { Button } from '@tacc/core-components';
import HeaderNavBar from '@hazmapper/components/HeaderNavBar';
import hazmapperLogo from '@hazmapper/assets/Hazmapper-Stack@4x.png';
import nsfLogo from '@hazmapper/assets/nsf.png';
import designsafeLogo from '@hazmapper/assets/designsafe.svg';
import nheriLogo from '@hazmapper/assets/nheri.png';

const MainMenu = () => {
  const location = useLocation();
  const [api, contextHolder] = notification.useNotification();
  const hasShownNotification = useRef(false);

  useEffect(() => {
    // Check if we arrived here after deleting a map and haven't shown notification yet
    if (location.state?.showDeleteSuccess && !hasShownNotification.current) {
      api.success({
        message: 'Success',
        description: 'Your map was successfully deleted.',
        placement: 'topRight',
      });
      // Mark notification as shown
      hasShownNotification.current = true;
      // Clear the state so notification doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, api]);
  return (
    <div className={styles.root}>
      {contextHolder}
      <HeaderNavBar />
      <div className={styles.listingContainer}>
        <div className={styles.versionContainer}>
          <img src={hazmapperLogo} alt="Hazmapper Logo"></img>
          <div className={styles.version}>{'Version 2.19'}</div>
        </div>
        <ProjectListing />
        <Button
          className={styles.userGuide}
          iconNameBefore="exit"
          type="link"
          onClick={(e) => {
            window.open(
              'https://www.designsafe-ci.org/user-guide/tools/visualization/#hazmapper-user-guide',
              '_blank',
              'noopener,noreferrer'
            );
            // To prevent active box around link lingering after click
            e.currentTarget.blur();
          }}
        >
          User Guide
        </Button>
        <Button
          className={styles.userGuide}
          iconNameBefore="exit"
          type="link"
          onClick={(e) => {
            window.open(
              'https://www.designsafe-ci.org/user-guide/tools/visualization/#taggit-user-guide-basic-image-browsing-and-mapping',
              '_blank',
              'noopener,noreferrer'
            );
            // To prevent active box around link lingering after click
            e.currentTarget.blur();
          }}
        >
          Taggit User Guide
        </Button>
      </div>
      <div className={styles.sponsorContainer}>
        <a href="https://www.nsf.gov/">
          <img
            src={nsfLogo}
            alt="National Science Foundation website"
            width="60px"
          />
        </a>
        <a href="https://www.designsafe-ci.org/">
          <img
            src={designsafeLogo}
            alt="NHERI DesignSafe website"
            width="200px"
          />
        </a>
        <a href="https://www.designsafe-ci.org/about/">
          <img src={nheriLogo} alt="NHERI website" width="150px" />
        </a>
      </div>
    </div>
  );
};

export default MainMenu;
