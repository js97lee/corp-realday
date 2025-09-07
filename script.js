// Three.js Scene Setup
let scene, camera, renderer, particles, mouseX = 0, mouseY = 0;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Renderer setup
    const canvas = document.getElementById('three-canvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Create particle system
    createParticleSystem();
    
    // Create floating geometric shapes
    createFloatingShapes();
    
    // Camera position
    camera.position.z = 5;

    // Mouse event listeners
    document.addEventListener('mousemove', onMouseMove, false);
    
    // Start animation
    animate();
}

function createParticleSystem() {
    const particleCount = 800;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        // Positions
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

        // Colors - white to gray gradient
        const intensity = Math.random() * 0.5 + 0.5;
        colors[i * 3] = intensity;
        colors[i * 3 + 1] = intensity;
        colors[i * 3 + 2] = intensity;

        // Sizes
        sizes[i] = Math.random() * 3 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create shader material for better performance and effects
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            pointTexture: { value: createCircleTexture() }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vColor = color;
                
                vec3 pos = position;
                pos.x += sin(time * 0.001 + position.y * 0.01) * 0.5;
                pos.y += cos(time * 0.001 + position.x * 0.01) * 0.3;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D pointTexture;
            varying vec3 vColor;
            
            void main() {
                vec4 textureColor = texture2D(pointTexture, gl_PointCoord);
                gl_FragColor = vec4(vColor, textureColor.a * 0.8);
            }
        `,
        transparent: true,
        vertexColors: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createFloatingShapes() {
    // Create floating geometric shapes
    const shapes = [];
    
    // Torus
    const torusGeometry = new THREE.TorusGeometry(0.6, 0.2, 16, 100);
    const torusMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.1,
        wireframe: true
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-3, 2, -2);
    scene.add(torus);
    shapes.push({ mesh: torus, rotationSpeed: { x: 0.005, y: 0.01, z: 0 } });

    // Octahedron
    const octaGeometry = new THREE.OctahedronGeometry(0.8);
    const octaMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.08,
        wireframe: true
    });
    const octahedron = new THREE.Mesh(octaGeometry, octaMaterial);
    octahedron.position.set(3, -2, -1);
    scene.add(octahedron);
    shapes.push({ mesh: octahedron, rotationSpeed: { x: 0.01, y: 0.005, z: 0.008 } });

    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.06,
        wireframe: true
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 3, -3);
    scene.add(sphere);
    shapes.push({ mesh: sphere, rotationSpeed: { x: 0.008, y: 0.012, z: 0.005 } });

    // Store shapes for animation
    scene.userData.shapes = shapes;
}

function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) / 100;
    mouseY = (event.clientY - window.innerHeight / 2) / 100;
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now();

    // Update particle system
    if (particles && particles.material.uniforms) {
        particles.material.uniforms.time.value = time;
        
        // Rotate particles based on mouse movement
        particles.rotation.x += (mouseY * 0.001 - particles.rotation.x) * 0.05;
        particles.rotation.y += (mouseX * 0.001 - particles.rotation.y) * 0.05;
    }

    // Animate floating shapes
    if (scene.userData.shapes) {
        scene.userData.shapes.forEach(({ mesh, rotationSpeed }) => {
            mesh.rotation.x += rotationSpeed.x;
            mesh.rotation.y += rotationSpeed.y;
            mesh.rotation.z += rotationSpeed.z;
            
            // Add subtle floating motion
            mesh.position.y += Math.sin(time * 0.001 + mesh.position.x) * 0.002;
        });
    }

    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Smooth scrolling for better performance
let ticking = false;

function updateParallax() {
    const scrollTop = window.pageYOffset;
    
    if (particles) {
        particles.rotation.y = scrollTop * 0.0001;
    }
    
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
}

window.addEventListener('scroll', requestTick);

// Add subtle interactions to project cards
document.addEventListener('DOMContentLoaded', function() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            // Add subtle scale effect with stagger
            setTimeout(() => {
                card.style.transform = 'translateY(-15px) scale(1.02)';
            }, index * 50);
        });
        
        card.addEventListener('mouseleave', function() {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add parallax effect to sections
    const sections = document.querySelectorAll('.section');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        
        sections.forEach((section, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrollTop * speed);
            section.style.transform = `translateY(${yPos}px)`;
        });
    });

    // Add click interaction to CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(0, 0, 0, 0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.marginLeft = '-10px';
            ripple.style.marginTop = '-10px';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .cta-button {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(style);
