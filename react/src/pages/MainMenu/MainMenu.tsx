import React, { useState } from 'react';
import {
  LoadingSpinner,
  InlineMessage,
  SectionHeader,
  Button,
} from '../../core-components';
import { useProjects } from '../../hooks';
import CreateMapModal from '../../components/CreateMapModal/CreateMapModal';

function MainMenu() {
  const { data, isLoading, error } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  if (isLoading) {
    return (
      <>
        <SectionHeader isNestedHeader>Main Menu</SectionHeader>
        <LoadingSpinner />
      </>
    );
  }
  if (error) {
    <>
      <SectionHeader isNestedHeader>Main Menu</SectionHeader>
      <InlineMessage type="error">Unable to retrieve projects.</InlineMessage>
    </>;
  }
  return (
    <>
      <SectionHeader isNestedHeader>Main Menu</SectionHeader>
      <Button type="primary" size="small" onClick={toggleModal}>
        Create Map
      </Button>
      <CreateMapModal isOpen={isModalOpen} toggle={toggleModal} />
      <table>
        <thead>Projects</thead>
        <tbody>You have {data?.length} projects.</tbody>
      </table>
    </>
  );
}

export default MainMenu;
