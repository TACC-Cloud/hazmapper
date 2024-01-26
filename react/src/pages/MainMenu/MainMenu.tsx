import React, { useState } from 'react';
import {
  LoadingSpinner,
  InlineMessage,
  SectionHeader,
} from '../../core-components';
import { useProjects } from '../../hooks';
import useAuthenticatedUser from '../../hooks/user/useAuthenticatedUser';
import { SystemSelect } from '../../components/Systems';

function MainMenu() {
  const { data, isLoading, error } = useProjects();
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useAuthenticatedUser();

  const [selectedSystem, setSelectedSystem] = useState('');

  if (isLoading || isUserLoading) {
    return (
      <>
        <SectionHeader isNestedHeader>Main Menu</SectionHeader>
        <LoadingSpinner />
      </>
    );
  }
  if (error || userError) {
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
      <InlineMessage type="success">
        Welcome, {userData?.username || 'User'}
      </InlineMessage>

      <table>
        <thead>Projects</thead>
        <tbody>You have {data?.length} projects.</tbody>
      </table>

      {selectedSystem && <div>Current system selected: {selectedSystem}</div>}
      <SystemSelect onSystemSelect={handleSelectChange}></SystemSelect>
    </>
  );
}

export default MainMenu;
