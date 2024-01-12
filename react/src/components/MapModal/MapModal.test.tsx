import React, { useState } from 'react';
import { Button } from 'reactstrap';
import MapModal from './MapModal';

const ModalTestPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Dummy onSubmit function for testing
  const dummyOnSubmit = () => {
    // No operation (noop)
  };

  return (
    <div>
      <Button color="secondary" onClick={toggleModal}>
        Open Map Modal
      </Button>
      <MapModal
        isOpen={isModalOpen}
        toggle={toggleModal}
        onSubmit={dummyOnSubmit}
        isCreating={false}
      />
    </div>
  );
};

export default ModalTestPage;
