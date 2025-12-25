import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Work.css';

const Work = () => {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [activeTab, setActiveTab] = useState('develop');

  const workData = {
    design: [
      { title: "XR Brand Experience", desc: "몰입형 브랜드 경험 디자인", tech: ["Unity", "VR", "UI/UX"], category: "design" },
      { title: "Smart Glasses UI", desc: "웨어러블 인터페이스 디자인", tech: ["HoloLens", "MR"], category: "design" },
      { title: "Virtual Showroom", desc: "가상 쇼룸 디자인", tech: ["3D", "VR"], category: "design" },
      { title: "AR Interface Design", desc: "증강현실 인터페이스", tech: ["ARKit", "UI/UX"], category: "design" },
      { title: "Metaverse Avatar", desc: "메타버스 아바타 디자인", tech: ["3D", "Character"], category: "design" },
      { title: "XR Navigation", desc: "확장현실 네비게이션", tech: ["UX", "Spatial"], category: "design" },
      { title: "Virtual Event Space", desc: "가상 이벤트 공간", tech: ["3D", "Event"], category: "design" },
      { title: "AR Product Demo", desc: "제품 데모 AR", tech: ["AR", "Product"], category: "design" }
    ],
    develop: [
      { title: "AR Mobile App", desc: "증강현실 모바일 경험", tech: ["ARKit", "iOS"], category: "develop" },
      { title: "Metaverse Platform", desc: "가상공간 플랫폼 구축", tech: ["WebXR", "3D"], category: "develop" },
      { title: "VR Training System", desc: "VR 교육 시스템", tech: ["Unity", "VR"], category: "develop" },
      { title: "AR Navigation App", desc: "AR 내비게이션 앱", tech: ["ARKit", "GPS"], category: "develop" },
      { title: "WebXR Experience", desc: "웹 XR 경험", tech: ["WebXR", "Three.js"], category: "develop" },
      { title: "VR Social Platform", desc: "VR 소셜 플랫폼", tech: ["Unity", "Multiplayer"], category: "develop" },
      { title: "AR Shopping", desc: "AR 쇼핑 경험", tech: ["AR", "E-commerce"], category: "develop" },
      { title: "VR Conference", desc: "VR 컨퍼런스", tech: ["VR", "Communication"], category: "develop" }
    ],
    product: [
      { title: "XR Headset Design", desc: "XR 헤드셋 디자인", tech: ["Hardware", "Design"], category: "product" },
      { title: "AR Glasses", desc: "AR 안경", tech: ["Wearable", "AR"], category: "product" },
      { title: "VR Controller", desc: "VR 컨트롤러", tech: ["Hardware", "VR"], category: "product" },
      { title: "Haptic Device", desc: "햅틱 디바이스", tech: ["Hardware", "Haptic"], category: "product" },
      { title: "XR Camera", desc: "XR 카메라", tech: ["Camera", "XR"], category: "product" },
      { title: "Motion Tracker", desc: "모션 트래커", tech: ["Sensor", "Tracking"], category: "product" },
      { title: "AR Display", desc: "AR 디스플레이", tech: ["Display", "AR"], category: "product" },
      { title: "VR Backpack", desc: "VR 백팩", tech: ["Hardware", "VR"], category: "product" }
    ]
  };

  const currentData = workData[activeTab] || [];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <section id="work" className="work">
      <div className="container">
        <motion.div className="section-header" ref={ref} initial={{ opacity: 0, y: 50 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}>
          <div className="section-tag">PORTFOLIO</div>
          <h2>Portfolio</h2>
          <p>확장현실을 통해 새로운 차원의 경험을 설계합니다</p>
        </motion.div>
        
        {/* Tab Navigation */}
        <div className="work-tabs">
          {[
            { id: 'develop', label: 'Develop' },
            { id: 'design', label: 'Design' },
            { id: 'product', label: 'Product' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`work-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Work Gallery */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            className="work-gallery"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {currentData.map((work, index) => (
              <div 
                key={`${activeTab}-${index}`}
                className="work-card"
              >
                <div className="work-preview">
                  <div className="work-overlay">
                    <div className="work-info">
                      <h3>{work.title}</h3>
                      <p>{work.desc}</p>
                      <div className="work-tech">{work.tech.map((t, i) => <span key={i}>{t}</span>)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
        
      </div>
    </section>
  );
};

export default Work;
