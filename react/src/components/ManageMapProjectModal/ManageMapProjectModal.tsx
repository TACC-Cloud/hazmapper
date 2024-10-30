import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Container, Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap';
import styles from './ManageMapProjectModal.module.css';

interface ManageMapProjectModalProps {
  // isPublic: boolean;
}

const ManageMapProjectModal: React.FC<ManageMapProjectModalProps> = ({
  // isPublic,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const closeModal = () => {
    const params = new URLSearchParams(location.search);
    params.delete('panel'); // Remove the panel query parameter
    navigate(`${location.pathname}?${params.toString()}`); // Update the URL
  };

  return (
    // <Modal className="modal-dialog-centered" size="lg" isOpen toggle={closeModal}>
    //   <ModalHeader toggle={closeModal}><b>Manage Map Project</b></ModalHeader>
    //   <ModalBody>
    //     <Container>
    //       <Row>
    //         <Col lg="6">
    //           <div className={styles.root}>
    //             <h3 style={{ marginBottom: '10px' }}>Map Project Information</h3>
    //             <div style={{ marginBottom: '10px' }}>Name: TBD</div>
    //             <div style={{ marginBottom: '10px' }}>Description: TBD</div>
    //             <div style={{ marginBottom: '10px' }}>Saved Location: TBD</div>
    //             <div style={{ marginBottom: '10px' }}>Is-Public: {isPublic}</div>
    //           </div>
    //         </Col>
    //         <Col lg="6">
    //           <div className={styles.root}>
    //             <h3 style={{ marginBottom: '10px' }}>Map Project Members</h3>
    //             <ul>
    //               <li>TBD</li>
    //             </ul>
    //           </div>
    //         </Col>
    //       </Row>
    //       <Row>
    //         <Col lg="6">
    //           <Button
    //             style={{ width: '12rem', marginBottom: '10px' }}
    //             color="success"
    //             size="md"
    //           >
    //             Make Map Public
    //           </Button>
    //         </Col>
    //         <Col lg="6">
    //           <Button
    //             style={{ width: '12rem', marginBottom: '10px' }}
    //             color="danger"
    //             size="md"
    //           >
    //             Delete Map
    //           </Button>
    //         </Col>
    //       </Row>
    //     </Container>
    //   </ModalBody>
    // </Modal>
    <div className={styles.root}>
      <h1>Map Management Panel</h1>
    </div>
  );
};

export default ManageMapProjectModal;
