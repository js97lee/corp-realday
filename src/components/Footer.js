import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">REALDAY</div>
              <p>FROM VISION TO INFINITE CREATION</p>
              <div className="footer-social">
                <a href="#" className="social-link">Instagram</a>
                <a href="#" className="social-link">LinkedIn</a>
                <a href="#" className="social-link">Behance</a>
              </div>
            </div>
            <div className="footer-nav">
              <div className="footer-column">
                <h4>Studio</h4>
                <a href="#about">About</a>
                <a href="#brands">Brands</a>
                <a href="#work">Work</a>
                <a href="#contact">Contact</a>
              </div>
              <div className="footer-column">
                <h4>Brands</h4>
                <a href="https://applex.kr" target="_blank" rel="noopener noreferrer">APPLEX</a>
                <a href="#" className="coming-soon">E.L.S (준비중)</a>
                <a href="https://luv-sachet.imweb.me/" target="_blank" rel="noopener noreferrer">LUV-Sachet</a>
              </div>
              <div className="footer-column">
                <h4>Services</h4>
                <a href="#">VR Development</a>
                <a href="#">AR Experience</a>
                <a href="#">XR Consulting</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 REALDAY. All rights reserved.</p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

