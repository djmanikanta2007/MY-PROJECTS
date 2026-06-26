/* ============================================
   DJ MANIKANTA — Portfolio Animations
   Advanced visual effects and animations
   Self-contained — no dependency on main.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ──────────────────────────────────────────
  // Utility: Detect touch device
  // ──────────────────────────────────────────

  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  const isMobile = () => window.innerWidth <= 768;


  // ──────────────────────────────────────────
  // Feature 1: Particle System (Canvas)
  // ──────────────────────────────────────────

  const particleCanvas = document.getElementById('hero-particles');

  if (particleCanvas && particleCanvas.getContext) {
    const ctx = particleCanvas.getContext('2d');
    let particles = [];
    let animationId = null;
    let canvasVisible = true;

    // Particle colors
    const particleColors = [
      'rgba(255,138,61,0.3)',
      'rgba(255,200,87,0.2)',
      'rgba(255,255,255,0.1)'
    ];

    /**
     * Resize canvas to match its container
     */
    const resizeCanvas = () => {
      const rect = particleCanvas.getBoundingClientRect();
      particleCanvas.width = rect.width;
      particleCanvas.height = rect.height;
    };

    /**
     * Create a single particle with random properties
     */
    const createParticle = () => {
      return {
        x: Math.random() * particleCanvas.width,
        y: Math.random() * particleCanvas.height,
        radius: Math.random() * 2 + 1, // 1–3px
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        speedX: (Math.random() - 0.5) * 0.6, // -0.3 to 0.3
        speedY: (Math.random() - 0.5) * 0.6, // -0.3 to 0.3
        opacity: Math.random() * 0.4 + 0.1,  // 0.1–0.5
        pulseSpeed: Math.random() * 0.015 + 0.005, // 0.005–0.02
        pulsePhase: Math.random() * Math.PI * 2 // Random starting phase
      };
    };

    /**
     * Initialize or re-initialize particles
     */
    const initParticles = () => {
      const count = isMobile() ? 30 : 60;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(createParticle());
      }
    };

    /**
     * Parse the rgba color and apply a new alpha value
     */
    const colorWithAlpha = (rgbaStr, alpha) => {
      // Extract the r,g,b values from the rgba string
      const match = rgbaStr.match(/rgba?\((\d+),(\d+),(\d+)/);
      if (match) {
        return `rgba(${match[1]},${match[2]},${match[3]},${alpha})`;
      }
      return rgbaStr;
    };

    /**
     * Main animation loop
     */
    const animateParticles = () => {
      if (!canvasVisible) {
        animationId = requestAnimationFrame(animateParticles);
        return;
      }

      ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

      const w = particleCanvas.width;
      const h = particleCanvas.height;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update position
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Pulsing opacity
        p.pulsePhase += p.pulseSpeed;
        const pulsingOpacity = p.opacity + Math.sin(p.pulsePhase) * 0.15;
        const clampedOpacity = Math.max(0.05, Math.min(0.6, pulsingOpacity));

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = colorWithAlpha(p.color, clampedOpacity);
        ctx.fill();

        // Draw connecting lines to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const lineOpacity = (1 - distance / 120) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 138, 61, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animateParticles);
    };

    // Visibility check — pause when canvas is not visible
    const particleObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        canvasVisible = entry.isIntersecting;
      });
    }, { threshold: 0 });

    particleObserver.observe(particleCanvas);

    // Initialize
    resizeCanvas();
    initParticles();
    animateParticles();

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
        initParticles();
      }, 200);
    }, { passive: true });
  }


  // ──────────────────────────────────────────
  // Feature 2: Mouse Parallax
  // ──────────────────────────────────────────

  if (!isTouchDevice() && !isMobile()) {
    const heroImageContainer = document.querySelector('.hero-image-container');
    const glow1 = document.querySelector('.hero-bg-glow .glow-1');
    const glow2 = document.querySelector('.hero-bg-glow .glow-2');

    // Current and target positions for smooth interpolation
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    const lerpFactor = 0.08;

    let parallaxActive = true;

    // Track mouse position relative to viewport center
    document.addEventListener('mousemove', (e) => {
      if (!parallaxActive) return;
      mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);  // -1 to 1
      mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2); // -1 to 1
    }, { passive: true });

    const animateParallax = () => {
      if (!parallaxActive) {
        requestAnimationFrame(animateParallax);
        return;
      }

      // Lerp toward target
      currentX += (mouseX - currentX) * lerpFactor;
      currentY += (mouseY - currentY) * lerpFactor;

      // Apply transforms (opposite direction for hero image)
      if (heroImageContainer) {
        const moveX = -currentX * 15;
        const moveY = -currentY * 15;
        heroImageContainer.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }

      if (glow1) {
        const moveX = currentX * 30;
        const moveY = currentY * 30;
        glow1.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }

      if (glow2) {
        const moveX = -currentX * 20;
        const moveY = currentY * 20;
        glow2.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }

      requestAnimationFrame(animateParallax);
    };

    animateParallax();

    // Disable parallax on resize to mobile
    window.addEventListener('resize', () => {
      parallaxActive = !isMobile();
      if (!parallaxActive) {
        // Reset transforms
        if (heroImageContainer) heroImageContainer.style.transform = '';
        if (glow1) glow1.style.transform = '';
        if (glow2) glow2.style.transform = '';
      }
    }, { passive: true });
  }


  // ──────────────────────────────────────────
  // Feature 3: Background Glow Animation
  // ──────────────────────────────────────────

  const heroBgGlow = document.querySelector('.hero-bg-glow');

  if (heroBgGlow) {
    let hueOffset = 0;
    const glowChildren = heroBgGlow.children;

    const animateGlow = () => {
      hueOffset += 0.15; // Slow continuous hue shift

      for (let i = 0; i < glowChildren.length; i++) {
        const child = glowChildren[i];
        const individualOffset = i * 120; // Spread hue across children
        const hue = (hueOffset + individualOffset) % 360;

        // Subtle position oscillation
        const xShift = Math.sin((hueOffset * 0.02) + i) * 5;
        const yShift = Math.cos((hueOffset * 0.015) + i * 0.7) * 5;

        child.style.setProperty('--glow-hue', `${hue}`);
        child.style.setProperty('--glow-x-shift', `${xShift}px`);
        child.style.setProperty('--glow-y-shift', `${yShift}px`);
      }

      requestAnimationFrame(animateGlow);
    };

    animateGlow();
  }


  // ──────────────────────────────────────────
  // Feature 4: Magnetic Button Effect
  // ──────────────────────────────────────────

  if (!isTouchDevice()) {
    const magneticButtons = document.querySelectorAll('.btn-primary');

    magneticButtons.forEach(btn => {
      const maxDistance = 100; // Detection radius in px
      const maxMove = 5;      // Max movement in px

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;

        const distX = e.clientX - btnCenterX;
        const distY = e.clientY - btnCenterY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < maxDistance) {
          // Calculate magnetic pull (stronger when closer)
          const strength = 1 - (distance / maxDistance);
          const moveX = distX * strength * (maxMove / maxDistance) * 2;
          const moveY = distY * strength * (maxMove / maxDistance) * 2;

          btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
          btn.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      }, { passive: true });
    });
  }


  // ──────────────────────────────────────────
  // Feature 5: Scroll-based Parallax
  // ──────────────────────────────────────────

  const heroSection = document.querySelector('#hero') || document.querySelector('.hero');
  const heroBgGlowParallax = document.querySelector('.hero-bg-glow');
  const scrollIndicator = document.querySelector('.scroll-indicator');

  if (heroSection) {
    let ticking = false;

    const handleScrollParallax = () => {
      const scrollY = window.scrollY;
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;

      // Only apply when hero section is visible
      if (scrollY < heroBottom) {
        if (heroBgGlowParallax) {
          heroBgGlowParallax.style.transform = `translateY(${scrollY * 0.3}px)`;
        }

        if (scrollIndicator) {
          const opacity = Math.max(0, 1 - scrollY / 300);
          scrollIndicator.style.transform = `translateY(${scrollY * -0.5}px)`;
          scrollIndicator.style.opacity = opacity;
        }
      }

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(handleScrollParallax);
        ticking = true;
      }
    }, { passive: true });

    // Run once on load
    handleScrollParallax();
  }

});
