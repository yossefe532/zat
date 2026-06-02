export function initUI() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebar-toggle');
  const close = document.getElementById('sidebar-close');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.add('open'));
  }
  
  if (close && sidebar) {
    close.addEventListener('click', () => sidebar.classList.remove('open'));
  }
  
  document.addEventListener('click', (e) => {
    if (sidebar && toggle && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });

  // Admin Panel Trigger: Double tap with two fingers on logos
  const logoContainer = document.querySelector('.logo-container');
  let lastTap = 0;
  
  if (logoContainer) {
    logoContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        const now = Date.now();
        if (now - lastTap < 500) { // Double tap detected
          import('./admin.js').then(module => module.openAdminPanel());
        }
        lastTap = now;
      }
    });

    // Fallback for desktop: Ctrl + Shift + Click
    logoContainer.addEventListener('click', (e) => {
      if (e.ctrlKey && e.shiftKey) {
        import('./admin.js').then(module => module.openAdminPanel());
      }
    });
  }
}

export function showMessage(element, message, type = 'error') {
  element.textContent = message;
  element.className = type === 'error' ? 'error-message show' : 'success-alert show';
  setTimeout(() => {
    element.classList.remove('show');
  }, 5000);
}

export function toast(msg) {
  const div = document.createElement('div');
  div.style.cssText = `
    position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
    background: var(--primary-red); color: white; padding: 15px 30px;
    border-radius: 10px; font-weight: bold; z-index: 9999;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2); animation: slideDown 0.3s ease;
  `;
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => {
    div.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => div.remove(), 300);
  }, 3000);
}
