import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Brands.css';

const Brands = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const brandsData = [
    {
      name: "APPLEX",
      status: "Active",
      type: "XR Developer Group",
      description: "확장현실 기술 개발과 혁신적인 XR 솔루션을 제공하는 개발자 그룹",
      link: "https://applex.kr",
      isActive: true
    },
    {
      name: "E.L.S",
      status: "준비중",
      type: "Design Create Group", 
      description: "감정, 논리, 감각이 조화된 창의적 디자인을 전문으로 하는 크리에이티브 그룹",
      isActive: false
    },
    {
      name: "LUV-Sachet",
      status: "Active",
      type: "Lifestyle Brand",
      description: "감성적이고 실용적인 라이프스타일 제품을 통한 일상의 특별함 창조",
      link: "https://luv-sachet.imweb.me/",
      isActive: true
    }
  ];

  return (
    <section id="brands" className="brands">
      <div className="container">
        <motion.div 
          className="section-header"
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="section-tag">OUR ECOSYSTEM</div>
          <h2>Brands</h2>
          <p>각각의 전문성을 가진 브랜드들이 하나의 비전 아래 혁신을 만들어갑니다</p>
        </motion.div>
        
        <div className="brands-grid">
          {brandsData.map((brand, index) => (
            <motion.div
              key={index}
              className={`brand-card ${brand.isActive ? 'active' : 'coming-soon'}`}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={brand.isActive ? { y: -8, scale: 1.02 } : {}}
            >
              {brand.isActive && brand.link ? (
                <a href={brand.link} target="_blank" rel="noopener noreferrer" className="brand-link-wrapper">
                  <div className="brand-header">
                    <div className="brand-name">{brand.name}</div>
                    <div className={`brand-status ${brand.isActive ? 'active' : 'coming'}`}>
                      {brand.status}
                    </div>
                  </div>
                  <div className="brand-description">
                    <p>{brand.type}</p>
                    <p className="brand-detail">{brand.description}</p>
                  </div>
                  <div className="brand-link">
                    <span>Visit Site</span>
                    <div className="link-arrow">→</div>
                  </div>
                </a>
              ) : (
                <div>
                  <div className="brand-header">
                    <div className="brand-name">{brand.name}</div>
                    <div className={`brand-status ${brand.isActive ? 'active' : 'coming'}`}>
                      {brand.status}
                    </div>
                  </div>
                  <div className="brand-description">
                    <p>{brand.type}</p>
                    <p className="brand-detail">{brand.description}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Brands;

