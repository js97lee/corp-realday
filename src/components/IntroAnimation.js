import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './IntroAnimation.css';

const IntroAnimation = ({ onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const phases = [
    { text: "REALDAY", duration: 2000 },
    { text: "XR CREATIVE STUDIO", duration: 1500 },
    { text: "FROM VISION TO INFINITE CREATION", duration: 2000 }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPhase < phases.length - 1) {
        setCurrentPhase(currentPhase + 1);
      } else {
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(onComplete, 1000);
        }, 1000);
      }
    }, phases[currentPhase].duration);

    return () => clearTimeout(timer);
  }, [currentPhase, onComplete]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 1 }
    }
  };

  const textVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.5,
      y: 100
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8
      }
    },
    exit: { 
      opacity: 0,
      scale: 1.2,
      y: -50,
      transition: { duration: 0.5 }
    }
  };

  const particleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="intro-overlay"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Animated Background Particles */}
          <div className="particles-container">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="particle"
                variants={particleVariants}
                initial="hidden"
                animate="visible"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <motion.div className="intro-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhase}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="intro-text"
              >
                {phases[currentPhase].text}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Progress Indicator */}
          <div className="progress-container">
            <motion.div 
              className="progress-bar"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((currentPhase + 1) / phases.length) * 100}%`,
                transition: { duration: 0.5 }
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;

