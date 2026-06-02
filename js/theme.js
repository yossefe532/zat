export function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  const saved = localStorage.getItem('theme') || 'light';
  
  const apply = (theme) => {
    window.currentTheme = theme;
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (icon) icon.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (icon) icon.textContent = '🌙';
    }
  };

  apply(saved);
  
  if (btn) {
    btn.addEventListener('click', () => {
      const next = window.currentTheme === 'light' ? 'dark' : 'light';
      apply(next);
      localStorage.setItem('theme', next);
    });
  }
}
