import React from 'react';
import ProjectListing from '@hazmapper/components/Projects/ProjectListing';
import styles from './layout.module.css';
import HeaderNavBar from '@hazmapper/components/HeaderNavBar';

const MainMenu = () => {
  return (
    <div className={styles.root}>
      <HeaderNavBar />
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
