// REALDAY - Enhanced XR Studio (Outfit Font + Impact Design)
document.addEventListener('DOMContentLoaded', function() {
    
    // Enhanced logo intro animation
    const introOverlay = document.getElementById('introOverlay');
    
    // Hide intro after animation completes
    setTimeout(() => {
        introOverlay.classList.add('hidden');
        // Remove from DOM after fade out
        setTimeout(() => {
            introOverlay.remove();
        }, 1000);
    }, 3500); // Show for 3.5 seconds for enhanced animation
    
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
            nav.style.background = 'rgba(255, 255, 255, 0.98)';
            nav.querySelector('.nav-pill').style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
        } else {
            nav.style.background = 'transparent';
            nav.querySelector('.nav-pill').style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
        }
        
        lastScroll = currentScroll;
    });

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.3;
            hero.style.transform = `translateY(${parallax}px)`;
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
        fontWeight: '400'
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
        
        // Parallax elements
        const parallaxElements = document.querySelectorAll('.phil-card, .brand-card');
        parallaxElements.forEach((el, index) => {
            const speed = (index % 3 + 1) * 0.02;
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
    const fontLoad = new FontFace('Outfit', 'url(https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700;800;900&display=swap)');
    fontLoad.load().then(function(loadedFont) {
        document.fonts.add(loadedFont);
    });
});
