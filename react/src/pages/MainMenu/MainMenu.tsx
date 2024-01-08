import React from 'react';
import {
  LoadingSpinner,
  InlineMessage,
  SectionHeader,
  SectionTableWrapper,
} from '../../core-components';
import { useProjects } from '../../hooks';

function MainMenu() {
  const { data, isLoading, error } = useProjects();
  if (isLoading) {
    return(
<>
      <SectionHeader isNestedHeader>Main Menu</SectionHeader>
      <LoadingSpinner />
      </>)
  }
  if (error) {
    return (
      <>
        <SectionHeader isNestedHeader>Main Menu</SectionHeader>
        <InlineMessage type="error">Unable to retrieve projects.</InlineMessage>
      </>
    );
  }
  return (
    <>
      <SectionHeader isNestedHeader>Main Menu</SectionHeader>

      <table>
        <thead>Projects</thead>
        <tbody>You have {data?.length} projects.</tbody>
      </table>
    </>
  );
}

export default MainMenu;
