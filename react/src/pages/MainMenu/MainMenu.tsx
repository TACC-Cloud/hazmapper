import React from 'react';
import { useProjects } from '../../hooks';

function MainMenu() {
  const { data, isLoading, error } = useProjects();
  return (
    <>
      <h2>Main Menu</h2>
      <h5>You have {data?.length} projects. </h5>
    </>
  );
}

export default MainMenu;
