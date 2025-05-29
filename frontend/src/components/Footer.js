import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; 
import './Footer.css'; // Importing the CSS file

const Footer = () => {
  return (
    <footer>
      <Container
        fluid
        className="text-white py-4"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.2)', // Subtle top border
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)', // Subtle bottom border
        }}
      >
        <Row className="align-items-center">
          {/* Logo Section */}
          <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
            <h4 className="text-uppercase fw-bold">SmartRep</h4>
            <p className="mb-0">We tranform your personality not body</p>
          </Col>

          {/* Social Media Links */}
          <Col md={4} className="text-center">
            <div className="d-flex justify-content-center">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white mx-2"
                style={{ fontSize: '1.5rem', opacity: 0.8 }}
              >
                <FaFacebook />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white mx-2"
                style={{ fontSize: '1.5rem', opacity: 0.8 }}
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white mx-2"
                style={{ fontSize: '1.5rem', opacity: 0.8 }}
              >
                <FaInstagram />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white mx-2"
                style={{ fontSize: '1.5rem', opacity: 0.8 }}
              >
                <FaLinkedin />
              </a>
            </div>
          </Col>

          {/* Contact Details */}
          <Col md={4} className="text-center text-md-end">
            <p className="mb-0">© 2024 SmartRep, Inc.</p>
            <p className="mb-0"><a href="mailto:aditya@gmail.com">support@smartrep.com</a> | +123 456 7890</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
