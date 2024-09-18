import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import styles from './ManageMapProjectModal.module.css';

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
    <Modal classNme="modal-dialog-centered" size="lg" isOpen toggle={closeModal}>
      <ModalHeader toggle={closeModal}>Manage Map</ModalHeader>
      <ModalBody>
        {/* <div className={styles.root}></div> */}
        <Container>
          <Row>
            <Col lg="8">
            <div>
              <h3 style={{ marginBottom: '10px' }}>Map Details</h3>
              <h4 style={{ marginBottom: '10px' }}>Map Name: TBD</h4>
              <h4 style={{ marginBottom: '10px' }}>Map Description: TBD</h4>
              <h4 style={{ marginBottom: '10px' }}>Map Saved Location: TBD</h4>
              <h4 style={{ marginBottom: '10px' }}>Map Is-Public: {isPublic}</h4>
              <Button
                style={{ marginBottom: '10px' }}
                // className={}
                type="secondary"
                // iconNameBefore="trash"
                // attr="submit"
                // isLoading={isFetching}
              >
                Make Map Public
              </Button>
              <br/>
              <Button
              style={{ marginTop: '10px' }}
                // className={}
                type="secondary"
                // iconNameBefore="trash"
                // attr="submit"
                // isLoading={isFetching}
              >
                Delete Map
              </Button>
            </div>
            </Col>
            <Col lg="4">
            <div>
              <h3 style={{ marginBottom: '10px' }}>Map Users</h3>
              <h4 style={{ marginBottom: '10px' }}>Current Members: TBD</h4>  
            </div>
            </Col>
          </Row>
        </Container>
      </ModalBody>
    </Modal>
  );
};

export default ManageMapProjectModal;
