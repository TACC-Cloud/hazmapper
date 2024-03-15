import React, { useState } from 'react';
import {
  LoadingSpinner,
  InlineMessage,
  SectionHeader,
  Icon,
  Button,
} from '../../core-components';
import { useProjects } from '../../hooks';
import useAuthenticatedUser from '../../hooks/user/useAuthenticatedUser';
import { SystemSelect } from '../../components/Systems';
import CreateMapModal from '../../components/CreateMapModal/CreateMapModal';

function MainMenu() {
  const { data, isLoading, error } = useProjects();
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useAuthenticatedUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };


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
      <div>
        <Button type="primary" size="small" onClick={toggleModal}>
          Create Map
        </Button>
      </div>
      <InlineMessage type="info">
        Welcome, {userData?.username || 'User'} <Icon name="user"></Icon>
      </InlineMessage>
      <CreateMapModal isOpen={isModalOpen} toggle={toggleModal} />
      <table>
        <thead>
          <tr>
            <th>Projects</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>You have {data?.length} projects.</td>
          </tr>
        </tbody>
      </table>

      {selectedSystem && <div>Current system selected: {selectedSystem}</div>}
      <SystemSelect onSystemSelect={handleSelectChange}></SystemSelect>
    </>
  );
}

export default MainMenu;
