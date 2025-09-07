// REALDAY - Minimal XR Studio (LHBZR Style)
document.addEventListener('DOMContentLoaded', function() {
    
    // Logo intro animation
    const introOverlay = document.getElementById('introOverlay');
    
    // Hide intro after animation completes
    setTimeout(() => {
        introOverlay.classList.add('hidden');
        // Remove from DOM after fade out
        setTimeout(() => {
            introOverlay.remove();
        }, 1000);
    }, 3000); // Show for 3 seconds
    
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
            if (navPill.style.display === 'block') {
                navPill.style.display = 'none';
                navPill.style.opacity = '0';
            } else {
                navPill.style.display = 'block';
                navPill.style.position = 'fixed';
                navPill.style.top = '80px';
                navPill.style.left = '50%';
                navPill.style.transform = 'translateX(-50%)';
                navPill.style.opacity = '1';
            }
            this.classList.toggle('active');
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
                    input.style.borderBottomColor = '#dc3545';
                } else {
                    input.style.borderBottomColor = 'var(--gray-300)';
                }
            });
            
            if (isValid) {
                // Show success message
                showNotification('메시지가 성공적으로 전송되었습니다.', 'success');
                this.reset();
                
                // Reset form styles
                inputs.forEach(input => {
                    input.style.borderBottomColor = 'var(--gray-300)';
                });
            } else {
                showNotification('모든 필수 필드를 입력해주세요.', 'error');
            }
        });
    }

    // Intersection Observer for subtle animations
    const observeElements = document.querySelectorAll('.work-card, .phil-card');
    
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
            rootMargin: '0px 0px -30px 0px'
        });

        observeElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // Minimal button interactions
    const buttons = document.querySelectorAll('.btn-primary, .btn-contact, .btn-submit');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Family card hover effects
    const familyCards = document.querySelectorAll('.family-card:not(.coming-soon)');
    familyCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.paddingLeft = '12px';
            this.style.color = 'var(--gray-600)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.paddingLeft = '0';
            this.style.color = 'var(--black)';
        });
    });

    // Work card subtle hover
    const workCards = document.querySelectorAll('.work-card');
    workCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Smooth page load
    document.body.style.opacity = '0';
    window.addEventListener('load', function() {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '1';
    });

    // Keyboard navigation (ESC 키로 모바일 메뉴 닫기)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const menuToggle = document.querySelector('.menu-toggle');
            const navPill = document.querySelector('.nav-pill');
            if (menuToggle && navPill) {
                menuToggle.classList.remove('active');
                navPill.classList.remove('mobile-open');
            }
        }
    });
});

// Minimal notification system
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
            <span class="notification-text">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Apply minimal styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '32px',
        background: type === 'success' ? 'var(--black)' : '#dc3545',
        color: 'var(--white)',
        padding: '0',
        borderRadius: '2px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
        zIndex: '10000',
        maxWidth: '400px',
        minWidth: '300px',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        border: '1px solid var(--gray-200)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        fontWeight: '300'
    });

    // Style notification content
    const content = notification.querySelector('.notification-content');
    Object.assign(content.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        gap: '16px'
    });

    // Style text
    const text = notification.querySelector('.notification-text');
    Object.assign(text.style, {
        flex: '1',
        lineHeight: '1.4'
    });

    // Style close button
    const closeBtn = notification.querySelector('.notification-close');
    Object.assign(closeBtn.style, {
        background: 'none',
        border: 'none',
        color: 'var(--white)',
        fontSize: '16px',
        cursor: 'pointer',
        padding: '0',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.2s ease',
        opacity: '0.7'
    });

    closeBtn.addEventListener('mouseenter', function() {
        this.style.opacity = '1';
    });

    closeBtn.addEventListener('mouseleave', function() {
        this.style.opacity = '0.7';
    });

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Auto remove after 4 seconds
    const autoRemove = setTimeout(() => {
        removeNotification(notification);
    }, 4000);

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
    }, 300);
}

// Performance optimization
window.addEventListener('load', function() {
    // Optimize scroll performance
    let ticking = false;
    
    function updateScrollElements() {
        // Minimal scroll effects only
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateScrollElements);
            ticking = true;
        }
    });
});
