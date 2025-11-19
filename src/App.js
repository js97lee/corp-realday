import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import IntroAnimation from './components/IntroAnimation';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Brands from './components/Brands';
import Work from './components/Work';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './App.css';

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const [showIntro, setShowIntro] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Preload fonts and images
    const preloadAssets = async () => {
      try {
        // Preload fonts
        if ('FontFace' in window) {
          const fontLoad = new FontFace('Outfit', 'url(https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700;800;900&display=swap)');
          await fontLoad.load();
          document.fonts.add(fontLoad);
        }
        
        // Simulate loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoaded(true);
      } catch (error) {
        console.log('Asset loading failed:', error);
        setIsLoaded(true);
      }
    };

    preloadAssets();
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <AnimatePresence>
          {showIntro && isLoaded && (
            <IntroAnimation onComplete={handleIntroComplete} />
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {!showIntro && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Navigation />
              <Routes>
                <Route path="/" element={
                  <>
                    <Hero />
                    <About />
                    <Brands />
                  </>
                } />
                <Route path="/portfolio" element={<Work />} />
                <Route path="/jisu-portfolio-25" element={<Work />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
              <Footer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
