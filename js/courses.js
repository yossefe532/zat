import { toast } from './ui.js';

export function initCourses() {
  const selectedCourses = new Set();
  
  // Hero Logic
  const startAr = document.getElementById('start-now-ar');
  const startEn = document.getElementById('start-now-en');
  const hero = document.getElementById('welcome-hero-section');
  const courses = document.getElementById('course-selection-section');

  const start = () => {
    if (hero) hero.style.display = 'none';
    if (courses) courses.style.display = 'block';
    window.scrollTo(0, 0);
  };

  if (startAr) startAr.addEventListener('click', start);
  if (startEn) startEn.addEventListener('click', start);

  // Selection Logic
  const cards = document.querySelectorAll('.course-card');
  const continueBtn = document.getElementById('continue-to-form-btn');

  cards.forEach(card => {
    const checkbox = card.querySelector('.course-card-checkbox');
    const course = card.getAttribute('data-course');

    card.addEventListener('click', (e) => {
      if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
      
      if (checkbox.checked) {
        card.classList.add('selected');
        selectedCourses.add(course);
      } else {
        card.classList.remove('selected');
        selectedCourses.delete(course);
      }
    });
  });

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (selectedCourses.size === 0) {
        toast(window.currentLang === 'ar' ? 'الرجاء اختيار دورة واحدة على الأقل' : 'Please select at least one course');
      } else {
        toast(window.currentLang === 'ar' ? `تم اختيار ${selectedCourses.size} دورات بنجاح!` : `${selectedCourses.size} courses selected successfully!`);
      }
    });
  }
}
