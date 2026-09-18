import { animate, inView, scroll } from "https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm";

document.addEventListener('DOMContentLoaded', () => {
  // 1. Apple-quality page load hero sequence
  const heroTitle = document.querySelector('.hero-title');
  const heroDesc = document.querySelector('.hero-desc');
  const heroActions = document.querySelector('.hero-actions');
  const heroVisual = document.querySelector('.hero-visual');

  if (heroTitle) animate(heroTitle, { opacity: [0, 1], y: [30, 0] }, { duration: 0.8, easing: [0.16, 1, 0.3, 1] });
  if (heroDesc) animate(heroDesc, { opacity: [0, 1], y: [20, 0] }, { duration: 0.8, delay: 0.2, easing: [0.16, 1, 0.3, 1] });
  if (heroActions) animate(heroActions, { opacity: [0, 1], y: [20, 0] }, { duration: 0.8, delay: 0.3, easing: [0.16, 1, 0.3, 1] });
  if (heroVisual) animate(heroVisual, { opacity: [0, 1], scale: [0.95, 1], y: [30, 0] }, { duration: 1, delay: 0.4, easing: [0.16, 1, 0.3, 1] });

  // 2. Buttery-smooth scroll animations (inView) for sections, bento cells, project cards
  const revealTargets = document.querySelectorAll('.bento-cell, .project-card, .section-header, #certifications > div > div, .contact-grid > div');

  revealTargets.forEach((el, index) => {
    // Set initial state
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';

    inView(el, () => {
      animate(
        el,
        { opacity: [0, 1], y: [40, 0] },
        {
          duration: 0.8,
          delay: (index % 3) * 0.1, // Staggered delay based on index
          easing: [0.16, 1, 0.3, 1] // Apple spring-like cubic bezier
        }
      );
    });
  });

  // 3. Premium hover interactions for buttons, project cards, bento cells
  const interactiveCards = document.querySelectorAll('.project-card, .bento-cell');

  interactiveCards.forEach(card => {
    card.addEventListener('mouseenter', () => animate(card, { scale: 1.02, y: -4 }, { duration: 0.3, easing: [0.16, 1, 0.3, 1] }));
    card.addEventListener('mouseleave', () => animate(card, { scale: 1, y: 0 }, { duration: 0.3, easing: [0.16, 1, 0.3, 1] }));
  });

  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => animate(btn, { scale: 1.04 }, { duration: 0.2, easing: [0.16, 1, 0.3, 1] }));
    btn.addEventListener('mouseleave', () => animate(btn, { scale: 1 }, { duration: 0.2, easing: [0.16, 1, 0.3, 1] }));
    btn.addEventListener('mousedown', () => animate(btn, { scale: 0.97 }, { duration: 0.1 }));
    btn.addEventListener('mouseup', () => animate(btn, { scale: 1.04 }, { duration: 0.1 }));
  });

  // 4. Smooth progress scroll bar on top
  const progressBar = document.createElement('div');
  progressBar.style.cssText = 'position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, #ffffff, #888888); z-index: 9999; width: 0%; transition: width 0.1s linear;';
  document.body.appendChild(progressBar);

  scroll(({ y }) => {
    progressBar.style.width = ${y.progress * 100}%;
  });
});
