import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ManageMapProjectModal.module.css';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

interface ManageMapProjectModalProps {
  isPublicView: boolean;
}

const ManageMapProjectModal: React.FC<ManageMapProjectModalProps> = ({
  isPublicView,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const closeModal = () => {
    const params = new URLSearchParams(location.search);
    params.delete('panel'); // Remove the panel query parameter
    navigate(`${location.pathname}?${params.toString()}`); // Update the URL
  };

  return (
    <Modal isOpen toggle={closeModal}>
      <ModalHeader toggle={closeModal}>TODO</ModalHeader>
      <ModalBody>
        <div className={styles.root}>
          Manage Map Project TODO, isPublicView: {isPublicView}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ManageMapProjectModal;
