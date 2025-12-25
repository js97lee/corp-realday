// REALDAY - Enhanced XR Studio with Three.js Background
document.addEventListener('DOMContentLoaded', function() {
    
    // Three.js Scene Setup for Hero Background
    let scene, camera, renderer, particles, particleSystem;
    let mouseX = 0, mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    function initThreeJS() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;

        // Scene setup
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 1000;

        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);

        // Particle system for futuristic XR feel
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

        // Particle material with glow effect
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        // Add floating geometric shapes for XR aesthetic
        addFloatingShapes();

        // Animation loop
        animate();
    }

    function addFloatingShapes() {
        const shapes = [];
        const shapeCount = 15;

        for (let i = 0; i < shapeCount; i++) {
            let geometry, material, shape;
            
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

            material = new THREE.MeshBasicMaterial({
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

        // Store shapes for animation
        window.floatingShapes = shapes;
    }

    function animate() {
        requestAnimationFrame(animate);

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
        if (window.floatingShapes) {
            window.floatingShapes.forEach((shape, index) => {
                shape.rotation.x += 0.005 + index * 0.001;
                shape.rotation.y += 0.003 + index * 0.001;
                shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.2;
            });
        }

        // Mouse interaction
        camera.position.x += (mouseX - camera.position.x) * 0.02;
        camera.position.y += (-mouseY - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    // Mouse movement tracking
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.5;
        mouseY = (event.clientY - windowHalfY) * 0.5;
    });

    // Resize handler
    window.addEventListener('resize', () => {
        if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    });

    // Initialize Three.js after a short delay
    setTimeout(initThreeJS, 100);
    
    // Enhanced logo intro animation
    const introOverlay = document.getElementById('introOverlay');
    
    // Hide intro after animation completes
    setTimeout(() => {
        introOverlay.classList.add('hidden');
        // Remove from DOM after fade out
        setTimeout(() => {
            introOverlay.remove();
        }, 1000);
    }, 3500);
    
    // Navigation smooth scroll
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active nav link
                document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });

    // Enhanced Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    function openMobileMenu() {
        menuToggle.classList.add('active');
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMobileMenu() {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    }
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (mobileMenu.classList.contains('open')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
        
        // Close menu when clicking on mobile menu links
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (mobileMenu.classList.contains('open') && 
                !mobileMenu.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }

    // Update active nav on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Enhanced Contact form submission
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form elements
            const inputs = this.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            
            // Enhanced validation with animations
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderBottomColor = '#dc3545';
                    input.style.transform = 'translateX(-4px)';
                    setTimeout(() => {
                        input.style.transform = 'translateX(4px)';
                        setTimeout(() => {
                            input.style.transform = 'translateX(0)';
                        }, 100);
                    }, 100);
                } else {
                    input.style.borderBottomColor = 'var(--gray-300)';
                    input.style.transform = 'translateX(0)';
                }
            });
            
            if (isValid) {
                // Show enhanced success message
                showNotification('메시지가 성공적으로 전송되었습니다. 빠른 시일 내에 연락드리겠습니다.', 'success');
                this.reset();
                
                // Reset form styles
                inputs.forEach(input => {
                    input.style.borderBottomColor = 'var(--gray-300)';
                    input.style.transform = 'translateX(0)';
                });
            } else {
                showNotification('모든 필수 필드를 입력해주세요.', 'error');
            }
        });
    }

    // Enhanced Intersection Observer for animations
    const observeElements = document.querySelectorAll('.work-card, .phil-card, .brand-card');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        observeElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(40px)';
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(el);
        });
    }

    // Enhanced button interactions
    const buttons = document.querySelectorAll('.btn-primary, .btn-contact, .btn-submit');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-3px)';
        });
    });

    // Brand card enhanced interactions
    const brandCards = document.querySelectorAll('.brand-card.active');
    brandCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-12px)';
            this.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.12)';
        });
    });

    // Work card enhanced hover
    const workCards = document.querySelectorAll('.work-card');
    workCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-12px)';
            const overlay = this.querySelector('.work-overlay');
            if (overlay) {
                overlay.style.background = 'linear-gradient(transparent, rgba(0, 0, 0, 0.9))';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            const overlay = this.querySelector('.work-overlay');
            if (overlay) {
                overlay.style.background = 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))';
            }
        });
    });

    // Philosophy card enhanced hover
    const philCards = document.querySelectorAll('.phil-card');
    philCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Enhanced page load animation
    document.body.style.opacity = '0';
    window.addEventListener('load', function() {
        document.body.style.transition = 'opacity 0.6s ease';
        document.body.style.opacity = '1';
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });

    // Enhanced scroll effects for nav
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        const nav = document.querySelector('.nav');
        
        if (currentScroll > 100) {
            nav.style.background = 'rgba(0, 0, 0, 0.95)'; // 어두운 배경으로 변경
            nav.querySelector('.nav-pill').style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
            nav.querySelector('.nav-pill').style.background = 'rgba(255, 255, 255, 0.1)';
            nav.querySelector('.nav-pill').style.backdropFilter = 'blur(20px)';
            
            // 네비 텍스트 색상도 변경
            nav.querySelectorAll('.nav-link, .logo').forEach(el => {
                el.style.color = 'white';
            });
        } else {
            nav.style.background = 'transparent';
            nav.querySelector('.nav-pill').style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
            nav.querySelector('.nav-pill').style.background = 'rgba(255, 255, 255, 0.95)';
            
            // 원래 색상으로 복원
            nav.querySelector('.logo').style.color = 'var(--black)';
            nav.querySelectorAll('.nav-link').forEach(el => {
                el.style.color = 'var(--gray-600)';
            });
        }
        
        lastScroll = currentScroll;
    });

    // Enhanced parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.1; // 더 부드러운 패럴랙스
            if (particleSystem) {
                particleSystem.rotation.y = scrolled * 0.0005;
            }
        });
    }
});

// Enhanced notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set notification content
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">${type === 'success' ? '✓' : '!'}</div>
            <span class="notification-text">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Apply enhanced styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '120px',
        right: '32px',
        background: type === 'success' ? 'var(--black)' : '#dc3545',
        color: 'var(--white)',
        padding: '0',
        borderRadius: '12px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
        zIndex: '10000',
        maxWidth: '420px',
        minWidth: '320px',
        transform: 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontFamily: 'Outfit, sans-serif'
    });

    // Style notification content
    const content = notification.querySelector('.notification-content');
    Object.assign(content.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px 24px',
        position: 'relative'
    });

    // Style icon
    const icon = notification.querySelector('.notification-icon');
    Object.assign(icon.style, {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        flexShrink: '0'
    });

    // Style text
    const text = notification.querySelector('.notification-text');
    Object.assign(text.style, {
        flex: '1',
        fontSize: '15px',
        lineHeight: '1.4',
        fontWeight: '500'
    });

    // Style close button
    const closeBtn = notification.querySelector('.notification-close');
    Object.assign(closeBtn.style, {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '20px',
        cursor: 'pointer',
        padding: '0',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s ease',
        flexShrink: '0'
    });

    closeBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255, 255, 255, 0.1)';
    });

    closeBtn.addEventListener('mouseleave', function() {
        this.style.background = 'none';
    });

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
        removeNotification(notification);
    }, 5000);

    // Clear timeout if manually closed
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoRemove);
    });
}

function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 400);
}

// Performance optimization
window.addEventListener('load', function() {
    // Optimize scroll performance
    let ticking = false;
    
    function updateScrollElements() {
        // Enhanced scroll effects
        const scrollY = window.pageYOffset;
        
        // Subtle parallax for cards
        const parallaxElements = document.querySelectorAll('.phil-card, .brand-card');
        parallaxElements.forEach((el, index) => {
            const speed = (index % 3 + 1) * 0.01;
            el.style.transform = `translateY(${scrollY * speed}px)`;
        });
        
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateScrollElements);
            ticking = true;
        }
    });
    
    // Preload critical fonts
    if ('FontFace' in window) {
        const fontLoad = new FontFace('Outfit', 'url(https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700;800;900&display=swap)');
        fontLoad.load().then(function(loadedFont) {
            document.fonts.add(loadedFont);
        }).catch(function(error) {
            console.log('Font loading failed:', error);
        });
    }
});
