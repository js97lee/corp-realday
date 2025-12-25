import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Contact.css';

const Contact = () => {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [formData, setFormData] = useState({ name: '', email: '', company: '', phone: '', type: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('메시지가 성공적으로 전송되었습니다!');
    setFormData({ name: '', email: '', company: '', phone: '', type: '', message: '' });
  };

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="contact-grid">
          <motion.div className="contact-info" ref={ref} initial={{ opacity: 0, x: -50 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }}>
            <div className="section-tag">GET IN TOUCH</div>
            <h2>Let's Create<br />Your XR Vision</h2>
            <p>새로운 차원의 경험을 함께 만들어갑니다.<br />당신의 비전을 확장현실로 구현해보세요.</p>
            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-content">
                  <span className="label">Email</span>
                  <a href="mailto:studio.realday@gmail.com">studio.realday@gmail.com</a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-content">
                  <span className="label">Phone</span>
                  <a href="tel:+82-10-2021-5243">+82 10-2021-5243</a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-content">
                  <span className="label">Location</span>
                  <span>Seoul, South Korea</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div className="contact-form" initial={{ opacity: 0, x: 50 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="form-container">
              <h3>프로젝트 문의</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input type="text" placeholder="이름" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  <input type="email" placeholder="이메일" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <input type="text" placeholder="회사명" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
                  <input type="text" placeholder="연락처" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group full">
                  <select required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="">프로젝트 유형 선택</option>
                    <option value="vr">VR Experience</option>
                    <option value="ar">AR Application</option>
                    <option value="mr">Mixed Reality</option>
                    <option value="web">Web XR</option>
                    <option value="other">기타</option>
                  </select>
                </div>
                <div className="form-group full">
                  <textarea placeholder="프로젝트에 대해 자세히 설명해주세요" rows="4" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}></textarea>
                </div>
                <button type="submit" className="btn-submit">메시지 보내기</button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

