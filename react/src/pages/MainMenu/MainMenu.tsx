import React from 'react';
import {
  LoadingSpinner,
  InlineMessage,
  SectionHeader,
} from '../../core-components';
import { useProjects } from '../../hooks';
import useAuthenticatedUser from '../../hooks/user/useAuthenticatedUser';

function MainMenu() {
  const { data, isLoading, error } = useProjects();
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useAuthenticatedUser();
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
    </>
  );
}

export default MainMenu;
