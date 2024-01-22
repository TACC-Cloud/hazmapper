import React from 'react';
import {
  LoadingSpinner,
  InlineMessage,
  SectionHeader,
} from '../../core-components';
import { useProjects } from '../../hooks';
import useName from '../../hooks/user/useName';

function MainMenu() {
  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useName();
  if (projectsLoading || isUserLoading) {
    return (
      <>
        <SectionHeader isNestedHeader>Main Menu</SectionHeader>
        <LoadingSpinner />
      </>
    );
  }
  if (projectsError || userError) {
    const errorMessage = projectsError
      ? 'Unable to retrieve projects.'
      : 'Unable to retrieve user information.';
    return (
      <>
        <SectionHeader isNestedHeader>Main Menu</SectionHeader>
        <InlineMessage type="error">{errorMessage}</InlineMessage>
      </>
    );
  }
  return (
    <>
      <SectionHeader isNestedHeader>Main Menu</SectionHeader>
      <InlineMessage type="success">
        Welcome, {userData?.name || 'User'}
      </InlineMessage>

      <table>
        <thead>
          <tr>
            <th>Projects</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>You have {projectsData?.length || 0} projects.</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default MainMenu;
