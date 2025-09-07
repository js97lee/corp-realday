// REALDAY - XR Studio JavaScript (경량화 버전)
document.addEventListener('DOMContentLoaded', function() {
    
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
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navPill = document.querySelector('.nav-pill');
    
    if (menuToggle && navPill) {
        menuToggle.addEventListener('click', function() {
            navPill.style.display = navPill.style.display === 'block' ? 'none' : 'block';
            this.classList.toggle('active');
        });
    }

    // Floating navigation scroll effect
    const nav = document.querySelector('.nav');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add scroll effect to nav pill
        if (currentScroll > 100) {
            nav.style.transform = 'translateX(-50%) translateY(-5px)';
            nav.querySelector('.nav-pill').style.background = 'rgba(0, 0, 0, 0.9)';
        } else {
            nav.style.transform = 'translateX(-50%) translateY(0)';
            nav.querySelector('.nav-pill').style.background = 'rgba(0, 0, 0, 0.8)';
        }
        
        lastScroll = currentScroll;
    });

    // Update active nav on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
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

    // Contact form submission
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form elements
            const inputs = this.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            
            // Basic validation
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#dc3545';
                    input.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
                } else {
                    input.style.borderColor = '#e9ecef';
                    input.style.boxShadow = 'none';
                }
            });
            
            if (isValid) {
                // Show success message
                showNotification('메시지가 성공적으로 전송되었습니다! 빠른 시일 내에 연락드리겠습니다.', 'success');
                this.reset();
                
                // Reset form styles
                inputs.forEach(input => {
                    input.style.borderColor = '#e9ecef';
                    input.style.boxShadow = 'none';
                });
            } else {
                showNotification('모든 필수 필드를 입력해주세요.', 'error');
            }
        });
    }

    // Intersection Observer for animations
    const observeElements = document.querySelectorAll('.work-card, .phil-card, .contact-item');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        observeElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // Enhanced button interactions
    const buttons = document.querySelectorAll('.btn-primary, .btn-contact, .btn-submit');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-2px)';
        });
    });

    // Family card interactions
    const familyCards = document.querySelectorAll('.family-card');
    familyCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('coming-soon')) {
                this.style.transform = 'translateY(-4px)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Work card hover effects
    const workCards = document.querySelectorAll('.work-card');
    workCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.querySelector('.work-overlay').style.background = 'rgba(0, 0, 0, 0.7)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.querySelector('.work-overlay').style.background = 'rgba(0, 0, 0, 0.3)';
        });
    });

    // Add loading animation
    document.body.style.opacity = '0';
    window.addEventListener('load', function() {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    });

    // XR Cube interaction
    const xrCube = document.querySelector('.xr-cube');
    if (xrCube) {
        let isHovering = false;
        
        xrCube.addEventListener('mouseenter', function() {
            isHovering = true;
            this.style.animationPlayState = 'paused';
        });
        
        xrCube.addEventListener('mouseleave', function() {
            isHovering = false;
            this.style.animationPlayState = 'running';
        });
        
        xrCube.addEventListener('mousemove', function(e) {
            if (isHovering) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                const rotateX = (y / rect.height) * 30;
                const rotateY = (x / rect.width) * 30;
                
                this.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
        });
    }
});

// Notification system
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

    // Apply styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: type === 'success' ? 'linear-gradient(135deg, #4caf50, #45a049)' : 'linear-gradient(135deg, #f44336, #d32f2f)',
        color: 'white',
        padding: '0',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        zIndex: '10000',
        maxWidth: '400px',
        minWidth: '300px',
        transform: 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    });

    // Style notification content
    const content = notification.querySelector('.notification-content');
    Object.assign(content.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        position: 'relative'
    });

    // Style icon
    const icon = notification.querySelector('.notification-icon');
    Object.assign(icon.style, {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
        flexShrink: '0'
    });

    // Style text
    const text = notification.querySelector('.notification-text');
    Object.assign(text.style, {
        flex: '1',
        fontSize: '14px',
        lineHeight: '1.4',
        fontWeight: '500'
    });

    // Style close button
    const closeBtn = notification.querySelector('.notification-close');
    Object.assign(closeBtn.style, {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '18px',
        cursor: 'pointer',
        padding: '0',
        width: '24px',
        height: '24px',
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
    // Lazy load non-critical animations
    setTimeout(() => {
        document.querySelectorAll('.liquid-blob, .floating-elements div').forEach(el => {
            el.style.willChange = 'transform';
        });
    }, 1000);
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close mobile menu if open
        const navPill = document.querySelector('.nav-pill');
        if (navPill && navPill.style.display === 'block') {
            navPill.style.display = 'none';
            document.querySelector('.menu-toggle').classList.remove('active');
        }
    }
});
