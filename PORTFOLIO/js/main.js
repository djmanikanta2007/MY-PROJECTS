/* ============================================
   DJ MANIKANTA — Portfolio Main JavaScript
   Core interactions and UI logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ──────────────────────────────────────────
  // Feature 1: Navigation
  // ──────────────────────────────────────────

  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const navHamburger = document.querySelector('.nav-hamburger');
  const navMobileMenu = document.querySelector('.nav-mobile-menu');
  const sections = document.querySelectorAll('section[id]');

  // Smooth scroll for nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Scroll-based nav styling & active section tracking
  const handleNavScroll = () => {
    const scrollY = window.scrollY;

    // Add .scrolled class when scrolled past 80px
    if (nav) {
      if (scrollY > 80) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }

    // Track active section
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // Run on load

  // Mobile hamburger toggle
  if (navHamburger && navMobileMenu) {
    navHamburger.addEventListener('click', () => {
      navHamburger.classList.toggle('active');
      navMobileMenu.classList.toggle('active');
    });

    // Close mobile menu when a link inside is clicked
    const mobileLinks = navMobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        navHamburger.classList.remove('active');
        navMobileMenu.classList.remove('active');
      });
    });
  }

  // Close mobile menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (navHamburger && navMobileMenu) {
        navHamburger.classList.remove('active');
        navMobileMenu.classList.remove('active');
      }
    }
  });


  // ──────────────────────────────────────────
  // Feature 2: Scroll Reveal (IntersectionObserver)
  // ──────────────────────────────────────────

  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target); // One-time animation
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }


  // ──────────────────────────────────────────
  // Feature 3: Portfolio Filter
  // ──────────────────────────────────────────

  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const shouldShow = filter === 'all' || category === filter;

        if (shouldShow) {
          // Show card
          card.style.display = '';
          // Small delay to allow display change before removing hidden class
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.classList.remove('hidden');
            });
          });
        } else {
          // Hide card with animation
          card.classList.add('hidden');
          // Wait for CSS transition to complete before hiding with display:none
          setTimeout(() => {
            if (card.classList.contains('hidden')) {
              card.style.display = 'none';
            }
          }, 400);
        }
      });
    });
  });


  // ──────────────────────────────────────────
  // Feature 4: Project Modal
  // ──────────────────────────────────────────

  const projectData = {
    'student-result': {
      title: 'Student Result Management System',
      category: 'Software Development',
      image: 'assets/images/project-student-result.svg',
      description: 'A comprehensive frontend application for managing student academic results directly in the browser. Features dynamic Javascript DOM manipulation, Chart.js integration, and LocalStorage data persistence.<br><br><strong>Demo Admin Login:</strong> Username: <code>admin</code> | Password: <code>1234</code>',
      features: ['CRUD operations with LocalStorage', 'Dynamic subject additions via Javascript', 'Interactive data visualization with Chart.js', 'Responsive Glassmorphism interface', 'Secure frontend authentication'],
      tags: ['HTML/CSS', 'JavaScript', 'Chart.js', 'LocalStorage', 'Bootstrap 5'],
      link: 'https://djmanikanta2007.github.io/student-result-management-system/StudentResultSystem/index.html'
    },
    'event-registration': {
      title: 'Online Event Registration System',
      category: 'Software Development',
      image: 'assets/images/project-event-registration.svg',
      description: 'A full-stack event registration platform that allows organizers to create events and participants to register seamlessly. Includes participant management, CSV export functionality, and a clean user interface.<br><br><strong>Demo Admin Login:</strong> Username: <code>admin</code> | Password: <code>1234</code>',
      features: ['Event creation and management', 'Participant registration system', 'CSV export for participant data', 'SQLite database storage', 'Clean and intuitive UI', 'Real-time participant tracking'],
      tags: ['Python', 'Flask', 'SQLite', 'HTML/CSS', 'CSV Export'],
      link: 'https://djmanikanta2007.github.io/student-result-management-system/OnlineEventRegistration/index.html'
    },
    'event-reels': {
      title: 'College Event Reels',
      category: 'Video Editing',
      image: 'assets/images/project-event-reels.svg',
      description: 'High-energy event recap reels crafted for college festivals and cultural events. Features dynamic transitions, beat-synced editing, color grading, and motion graphics that capture the essence and excitement of live events.',
      features: ['Dynamic transition effects', 'Beat-synced editing', 'Professional color grading', 'Motion graphics overlays', 'Multi-camera editing', 'Sound design and mixing'],
      tags: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Color Grading']
    },
    'social-media': {
      title: 'Social Media Content Edits',
      category: 'Video Editing',
      image: 'assets/images/project-social-media.svg',
      description: 'Engaging short-form video content optimized for Instagram Reels, YouTube Shorts, and other social platforms. Each piece is crafted with trending formats, attention-grabbing hooks, and platform-specific optimization.',
      features: ['Platform-optimized formatting', 'Trending audio integration', 'Attention-grabbing hooks', 'Caption and text animations', 'Thumbnail design', 'Performance-driven editing'],
      tags: ['Premiere Pro', 'CapCut', 'After Effects', 'Photoshop']
    },
    'photo-editing': {
      title: 'Photo Editing Portfolio',
      category: 'Photo Editing',
      image: 'assets/images/project-photo-editing.svg',
      description: 'Professional photo editing portfolio showcasing advanced retouching, color grading, composite work, and creative manipulations. Each project demonstrates a keen eye for detail and artistic vision.',
      features: ['Advanced retouching techniques', 'Creative color grading', 'Photo compositing', 'Background manipulation', 'Portrait enhancement', 'Batch editing workflows'],
      tags: ['Photoshop', 'Lightroom', 'Color Grading', 'Retouching']
    },
    'content-strategy': {
      title: 'Social Media Content Strategy',
      category: 'Social Media',
      image: 'assets/images/project-content-strategy.svg',
      description: 'End-to-end social media content creation and strategy. From ideation to publishing — creating cohesive visual narratives that drive engagement and build brand presence across multiple platforms.',
      features: ['Content calendar planning', 'Visual identity design', 'Cross-platform optimization', 'Engagement analytics tracking', 'Brand voice development', 'Trend-responsive content'],
      tags: ['Content Strategy', 'Canva', 'Photoshop', 'Analytics']
    }
  };

  const modalBackdrop = document.querySelector('.modal-backdrop');
  const modalClose = document.querySelector('.modal-close');

  /**
   * Populate and open the project modal
   */
  const openModal = (projectKey) => {
    const project = projectData[projectKey];
    if (!project || !modalBackdrop) return;

    // Populate modal content
    const modalTitle = modalBackdrop.querySelector('.modal-title');
    const modalCategory = modalBackdrop.querySelector('.modal-category');
    const modalImage = modalBackdrop.querySelector('.modal-image');
    const modalDescription = modalBackdrop.querySelector('.modal-description');
    const modalFeatures = modalBackdrop.querySelector('.modal-features');
    const modalTags = modalBackdrop.querySelector('.modal-tags');
    const modalLinks = modalBackdrop.querySelector('.modal-links');

    if (modalTitle) modalTitle.textContent = project.title;
    if (modalCategory) modalCategory.textContent = project.category;
    if (modalImage) {
      modalImage.src = project.image;
      modalImage.alt = project.title;
    }
    if (modalDescription) modalDescription.innerHTML = project.description;

    // Populate features list
    if (modalFeatures) {
      modalFeatures.innerHTML = project.features
        .map(f => `<li>${f}</li>`)
        .join('');
    }

    // Populate tags
    if (modalTags) {
      modalTags.innerHTML = project.tags
        .map(t => `<span class="modal-tag">${t}</span>`)
        .join('');
    }

    // Populate links
    if (modalLinks) {
      if (project.link) {
        modalLinks.innerHTML = `<a href="${project.link}" target="_blank" class="btn btn-primary" style="text-decoration: none;">View Live Demo</a>`;
      } else {
        modalLinks.innerHTML = '';
      }
    }

    // Show modal
    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  /**
   * Close the project modal
   */
  const closeModal = () => {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Click on project cards to open modal
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const projectKey = card.getAttribute('data-project');
      if (projectKey) {
        openModal(projectKey);
      }
    });
  });

  // Close modal: close button
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // Close modal: click on backdrop (not content)
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
  }

  // Close modal: Escape key (combined with mobile menu close above)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });


  // ──────────────────────────────────────────
  // Feature 5: Typing Effect
  // ──────────────────────────────────────────

  const typingElement = document.getElementById('typing-text');

  if (typingElement) {
    const typingStrings = [
      'Software Developer',
      'Video Editor',
      'Creative Technologist',
      'Full-Stack Developer',
      'Content Creator'
    ];

    let stringIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeSpeed = 80;    // ms per character (typing)
    const deleteSpeed = 40;  // ms per character (deleting)
    const pauseEnd = 2000;   // pause after typing complete
    const pauseStart = 500;  // pause before next string

    const type = () => {
      const currentString = typingStrings[stringIndex];

      if (!isDeleting) {
        // Typing forward
        typingElement.textContent = currentString.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentString.length) {
          // Finished typing — pause then start deleting
          isDeleting = true;
          setTimeout(type, pauseEnd);
          return;
        }

        setTimeout(type, typeSpeed);
      } else {
        // Deleting backward
        typingElement.textContent = currentString.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          // Finished deleting — move to next string
          isDeleting = false;
          stringIndex = (stringIndex + 1) % typingStrings.length;
          setTimeout(type, pauseStart);
          return;
        }

        setTimeout(type, deleteSpeed);
      }
    };

    // Start typing after a brief initial delay
    setTimeout(type, 1000);
  }


  // ──────────────────────────────────────────
  // Feature 6: Stat Counter Animation
  // ──────────────────────────────────────────

  const statNumbers = document.querySelectorAll('.stat-number');

  if (statNumbers.length > 0) {
    const animateCounter = (el) => {
      const target = el.getAttribute('data-target');

      // Handle special infinity symbol
      if (target === '∞' || target === 'Infinity') {
        el.textContent = '∞';
        return;
      }

      const isDecimal = target.includes('.');
      const targetValue = parseFloat(target);

      if (isNaN(targetValue)) {
        el.textContent = target;
        return;
      }

      const duration = 2000;
      const startTime = performance.now();
      const decimalPlaces = isDecimal ? (target.split('.')[1] || '').length : 0;

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic: 1 - (1 - t)^3
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = eased * targetValue;

        if (isDecimal) {
          el.textContent = currentValue.toFixed(decimalPlaces);
        } else {
          el.textContent = Math.floor(currentValue);
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          // Ensure final value is exact
          el.textContent = target;
        }
      };

      requestAnimationFrame(updateCounter);
    };

    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statObserver.unobserve(entry.target); // Only animate once
        }
      });
    }, {
      threshold: 0.5
    });

    statNumbers.forEach(el => statObserver.observe(el));
  }


  // ──────────────────────────────────────────
  // Feature 7: Back to Top Button
  // ──────────────────────────────────────────

  const backToTopBtn = document.querySelector('.back-to-top');

  if (backToTopBtn) {
    const handleBackToTopVisibility = () => {
      if (window.scrollY > 500) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', handleBackToTopVisibility, { passive: true });
    handleBackToTopVisibility(); // Check on load

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // ──────────────────────────────────────────
  // Feature 8: Contact Form (Mailto)
  // ──────────────────────────────────────────

  const contactForm = document.querySelector('.contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = contactForm.querySelector('[name="name"]') || contactForm.querySelector('#name');
      const emailInput = contactForm.querySelector('[name="email"]') || contactForm.querySelector('#email');
      const messageInput = contactForm.querySelector('[name="message"]') || contactForm.querySelector('#message');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      // Basic validation
      if (!name || !email || !message) {
        showFormMessage('Please fill in all fields.', 'error');
        return;
      }

      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormMessage('Please enter a valid email address.', 'error');
        return;
      }

      // Update button state
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : 'Send Message';
      if (submitBtn) submitBtn.textContent = 'Sending...';

      // Send to Flask backend
      fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success || data.message) {
          showFormMessage('Message sent successfully! I will get back to you soon.', 'success');
          contactForm.reset();
        } else {
          showFormMessage(data.error || 'Failed to send message. Please try again.', 'error');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showFormMessage('Server error. Please ensure the backend is running.', 'error');
      })
      .finally(() => {
        if (submitBtn) submitBtn.textContent = originalBtnText;
      });
    });
  }

  /**
   * Display a temporary message below the contact form
   */
  const showFormMessage = (text, type = 'success') => {
    // Remove existing message if any
    const existing = document.querySelector('.form-message');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = `form-message form-message--${type}`;
    msg.textContent = text;

    if (contactForm) {
      contactForm.appendChild(msg);
    }

    // Auto-remove after 4 seconds
    setTimeout(() => {
      msg.classList.add('fade-out');
      setTimeout(() => msg.remove(), 300);
    }, 4000);
  };


  // ──────────────────────────────────────────
  // Feature 9: Hero Elements Sequential Reveal
  // ──────────────────────────────────────────

  const heroElements = [
    '.hero-label',
    '.hero-title',
    '.hero-subtitle',
    '.hero-location',
    '.hero-buttons',
    '.hero-image-wrapper'
  ];

  const revealHeroSequentially = () => {
    heroElements.forEach((selector, index) => {
      const el = document.querySelector(selector);
      if (el) {
        setTimeout(() => {
          el.classList.add('revealed');
        }, 300 + (index * 150)); // 300ms initial delay + 150ms stagger
      }
    });
  };

  revealHeroSequentially();

});
