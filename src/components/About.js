import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './About.css';

const About = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const philosophyData = [
    {
      number: "01",
      title: "Creativity in Everyday Life",
      subtitle: "일상 속의 창의성",
      description: "우리는 디자인과 상상력을 일상에 불어넣어, 평범한 순간을 특별한 경험으로 바꿉니다."
    },
    {
      number: "02", 
      title: "Emotions that Connect",
      subtitle: "감정을 연결하는 힘",
      description: "우리는 감정을 불러일으키는 스토리와 오브제를 통해, 개인의 감정을 모두가 공감하는 연결로 확장합니다."
    },
    {
      number: "03",
      title: "Where Art Meets Technology", 
      subtitle: "예술과 기술의 융합",
      description: "우리는 예술적 비전과 XR·AI 같은 첨단 기술을 융합해, 미래 지향적인 디자인 경험을 만듭니다."
    }
  ];

  return (
    <section id="about" className="about">
      {/* Interactive background elements */}
      <div className="about-bg-elements">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="bg-element"
            style={{
              left: `${10 + i * 25}%`,
              top: `${20 + (i % 2) * 40}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container">
        <motion.div 
          className="about-grid"
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="about-text">
            <div className="section-tag">OUR PHILOSOPHY</div>
            <h2>Design Real Day</h2>
            <p className="intro-text">모든 순간에서 한번의 리얼한 경험을</p>
            <p className="desc-text">
              Studio RealDay는 순간적인 경험이 사람의 감각과 관점을 변화시킨다고 생각합니다. 
              우리는 한 번의 경험을 통해 새로운 감정을 일으키고, 세상을 바라보는 방식을 바꾸는 전환점을 설계합니다.
            </p>
          </div>
        </motion.div>
        
        <div className="philosophy-grid">
          {philosophyData.map((item, index) => (
            <motion.div 
              key={index}
              className="phil-card"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="phil-number">{item.number}</div>
              <div className="phil-content">
                <h4>{item.title}</h4>
                <h5>{item.subtitle}</h5>
                <p>{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
