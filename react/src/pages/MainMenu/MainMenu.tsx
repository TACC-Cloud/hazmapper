import React, { useState } from 'react';
import {
  LoadingSpinner,
  InlineMessage,
  SectionHeader,
  Icon,
} from '@tacc/core-components';
import useAuthenticatedUser from '@hazmapper/hooks/user/useAuthenticatedUser';
import { SystemSelect } from '@hazmapper/components/Systems';
import { ProjectListing } from '@hazmapper/components/Projects/ProjectListing';

function MainMenu() {
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
    <>
      <SectionHeader isNestedHeader>Main Menu</SectionHeader>
      <div>
        <InlineMessage type="info">
          Welcome, {userData?.username || 'User'} <Icon name="user"></Icon>
        </InlineMessage>
      </div>
      <ProjectListing />
      {selectedSystem && <div>Current system selected: {selectedSystem}</div>}
      <SystemSelect onSystemSelect={handleSelectChange}></SystemSelect>
    </>
  );
}

export default MainMenu;
