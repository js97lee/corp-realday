import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      
      // Update active section based on scroll position
      const sections = ['home', 'about', 'brands', 'work', 'contact'];
      const scrollPosition = window.scrollY + 200;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'about', label: 'About', path: '/' },
    { id: 'brands', label: 'Brands', path: '/' },
    { id: 'portfolio', label: 'Portfolio', path: '/portfolio' },
    { id: 'contact', label: 'Contact', path: '/contact' }
  ];

  const scrollToSection = (sectionId) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.nav 
      className={`nav ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="nav-container">
        <div className="nav-pill">
            <div className="nav-content">
              <Link to="/" className="logo">REALDAY</Link>
            <div className="nav-links">
              {navItems.map((item) => (
                (item.id === 'portfolio' || item.id === 'contact') ? (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => scrollToSection(item.id)}
                  >
                    {item.label}
                  </button>
                )
              ))}
            </div>
          </div>
        </div>
        
        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      {/* Mobile Menu */}
      <motion.div 
        className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}
        initial={{ x: '-100%' }}
        animate={{ x: isMenuOpen ? '0%' : '-100%' }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className="mobile-menu-content">
          <div className="mobile-logo">REALDAY</div>
          <div className="mobile-nav-links">
            {navItems.map((item) => (
              (item.id === 'portfolio' || item.id === 'contact') ? (
                <Link
                  key={item.id}
                  to={item.path}
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  className="mobile-nav-link"
                  onClick={() => scrollToSection(item.id)}
                >
                  {item.label}
                </button>
              )
            ))}
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navigation;
