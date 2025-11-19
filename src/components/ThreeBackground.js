import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ 
      canvas: mountRef.current, 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Particle system
    const particleCount = 3000;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2000;
      positions[i + 1] = (Math.random() - 0.5) * 2000;
      positions[i + 2] = (Math.random() - 0.5) * 1000;

      velocities[i] = (Math.random() - 0.5) * 0.5;
      velocities[i + 1] = (Math.random() - 0.5) * 0.5;
      velocities[i + 2] = (Math.random() - 0.5) * 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Floating geometric shapes
    const shapes = [];
    const shapeCount = 15;

    for (let i = 0; i < shapeCount; i++) {
      let geometry, shape;
      
      const shapeType = Math.floor(Math.random() * 3);
      
      switch(shapeType) {
        case 0:
          geometry = new THREE.BoxGeometry(20, 20, 20);
          break;
        case 1:
          geometry = new THREE.SphereGeometry(12, 32, 32);
          break;
        case 2:
          geometry = new THREE.ConeGeometry(10, 25, 8);
          break;
      }

      const material = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
        transparent: true,
        opacity: 0.1,
        wireframe: true
      });

      shape = new THREE.Mesh(geometry, material);
      
      shape.position.x = (Math.random() - 0.5) * 1500;
      shape.position.y = (Math.random() - 0.5) * 1500;
      shape.position.z = (Math.random() - 0.5) * 500;
      
      shape.rotation.x = Math.random() * Math.PI;
      shape.rotation.y = Math.random() * Math.PI;
      
      scene.add(shape);
      shapes.push(shape);
    }

    // Mouse interaction
    let mouseX = 0, mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX - windowHalfX) * 0.5;
      mouseY = (event.clientY - windowHalfY) * 0.5;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Update particle positions
      const positions = particleSystem.geometry.attributes.position.array;
      const velocities = particleSystem.geometry.attributes.velocity.array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        // Wrap around screen
        if (positions[i] > 1000) positions[i] = -1000;
        if (positions[i] < -1000) positions[i] = 1000;
        if (positions[i + 1] > 1000) positions[i + 1] = -1000;
        if (positions[i + 1] < -1000) positions[i + 1] = 1000;
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Animate floating shapes
      shapes.forEach((shape, index) => {
        shape.rotation.x += 0.005 + index * 0.001;
        shape.rotation.y += 0.003 + index * 0.001;
        shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.2;
      });

      // Mouse interaction
      camera.position.x += (mouseX - camera.position.x) * 0.02;
      camera.position.y += (-mouseY - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return <canvas ref={mountRef} className="hero-canvas" />;
};

export default ThreeBackground;

