import React from 'react';
import ProjectListing from '@hazmapper/components/Projects/ProjectListing';
import styles from './layout.module.css';
import { Button } from '@tacc/core-components';
import HeaderNavBar from '@hazmapper/components/HeaderNavBar';

const MainMenu = () => {
  return (
    <div className={styles.root}>
      <HeaderNavBar />
      <div className={styles.listingContainer}>
        <div className={styles.versionContainer}>
          <img
            src="./src/assets/Hazmapper-Stack@4x.png"
            alt="Hazmapper Logo"
          ></img>
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
