import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ManageMapProjectModal.module.css';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

interface ManageMapProjectModalProps {
  isPublic: boolean;
}

const ManageMapProjectModal: React.FC<ManageMapProjectModalProps> = ({
  isPublic,
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
      <ModalHeader toggle={closeModal}>Manage Map</ModalHeader>
      <ModalBody>
        <div className={styles.root}>
          <h3 style={{ marginBottom: '10px' }}>Map Details</h3>
          <h4 style={{ marginBottom: '10px' }}>Map Name: TBD</h4>
          <h4 style={{ marginBottom: '10px' }}>Map Description: TBD</h4>
          <h4 style={{ marginBottom: '10px' }}>Map Saved Location: TBD</h4>
          <h4 style={{ marginBottom: '10px' }}>Map Is-Public: {isPublic}</h4>
          <h3 style={{ marginBottom: '10px' }}>Map Users</h3>
          <h4 style={{ marginBottom: '10px' }}>Current Members: TBD</h4>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ManageMapProjectModal;
