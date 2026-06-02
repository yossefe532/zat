import { initTheme } from './theme.js';
import { initLang } from './lang.js';
import { initUI } from './ui.js';
import { initRegistration } from './registration.js';
import { initShare } from './share.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLang();
  initUI();
  initRegistration();
  initShare();
  
  // Hide site loader after everything is ready
  window.addEventListener('load', () => {
    const loader = document.getElementById('site-loader');
    if (loader) {
      setTimeout(() => {
        loader.classList.add('hide');
        
        // Show initial hero with animation
        const hero = document.getElementById('welcome-hero-section');
        if (hero) hero.classList.add('show');
      }, 500); // Optimized: 0.5s fade out
    }
  });

  // Animation observer for scroll/show elements
  const observerOptions = { threshold: 0.1 };
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.hero, .section, .grant-box, .course-card, .btn').forEach(el => {
    animationObserver.observe(el);
  });
});
