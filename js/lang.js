export function initLang() {
  const btns = document.querySelectorAll('.lang-btn');
  const saved = localStorage.getItem('lang') || 'ar';
  
  const apply = (lang) => {
    window.currentLang = lang;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.body.style.direction = lang === 'ar' ? 'rtl' : 'ltr';
    
    document.querySelectorAll('.content-ar, .content-en').forEach(el => {
      el.classList.remove('active');
      if (el.classList.contains('content-' + lang)) el.classList.add('active');
    });

    btns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    localStorage.setItem('lang', lang);
  };

  apply(saved);

  btns.forEach(btn => {
    btn.addEventListener('click', () => apply(btn.getAttribute('data-lang')));
  });
}
