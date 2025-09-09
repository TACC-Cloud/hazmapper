import React from 'react';
import ProjectListing from '@hazmapper/components/Projects/ProjectListing';
import styles from './layout.module.css';
import { Button } from '@tacc/core-components';
import { Row } from 'antd';
import HeaderNavBar from '@hazmapper/components/HeaderNavBar';
import hazmapperLogo from '@hazmapper/assets/Hazmapper-Stack@4x.png';
import nsfLogo from '@hazmapper/assets/nsf.png';
import designsafeLogo from '@hazmapper/assets/designsafe.svg';
import nheriLogo from '@hazmapper/assets/nheri.png';
import { useGetSystems } from '@hazmapper/hooks';

const MainMenu = () => {
  useGetSystems({ prefetch: true });
  return (
    <div className={styles.root}>
      <HeaderNavBar />
      <div className={styles.listingContainer}>
        <div className={styles.versionContainer}>
          <img src={hazmapperLogo} alt="Hazmapper Logo"></img>
          <div className={styles.version}>{'Version 2.19'}</div>
        </div>
        <ProjectListing />
        <Row justify="end">
          <Button
            className={styles.userGuide}
            type="link"
            iconNameBefore="exit"
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
        </Row>
        <Row justify="end">
          <Button
            className={styles.userGuide}
            type="link"
            iconNameBefore="exit"
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
        </Row>
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
