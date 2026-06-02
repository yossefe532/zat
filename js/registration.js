import { getCourses, getCodes, addRegistration, getDiscounts, getSettings } from './data.js';
import { showMessage, toast } from './ui.js';

let activatedGrant = null;
let selectedCourses = [];

export function initRegistration() {
  const basket = document.getElementById('smart-basket');
  const overlay = document.getElementById('basket-overlay');
  const toggleBtn = document.getElementById('basket-toggle-btn');
  const closeBtn = document.getElementById('close-basket');
  const continueToRegBtn = document.getElementById('basket-continue-to-reg');

  // Apply saved layouts on start
  import('./admin.js').then(m => m.applySavedLayout());

  const openBasket = () => {
    if (basket && overlay) {
      basket.classList.add('open');
      overlay.classList.add('show');
      document.body.classList.add('lock-scroll');
    }
  };

  const closeBasket = () => {
    if (basket && overlay) {
      basket.classList.remove('open');
      overlay.classList.remove('show');
      document.body.classList.remove('lock-scroll');
    }
  };

  if (toggleBtn) toggleBtn.onclick = (e) => {
    e.stopPropagation();
    openBasket();
  };
  
  if (closeBtn) closeBtn.onclick = (e) => {
    e.stopPropagation();
    closeBasket();
  };
  
  if (overlay) overlay.onclick = closeBasket;
  
  if (continueToRegBtn) continueToRegBtn.onclick = (e) => {
    e.stopPropagation();
    closeBasket();
    showRegistrationForm(window.currentLang);
  };

  // Close basket on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBasket();
  });

  // Check if we are already in course selection to show floating toggle
  const checkBasketVisibility = () => {
    const coursesSection = document.getElementById('course-selection-section');
    if (coursesSection && coursesSection.style.display === 'block') {
      if (toggleBtn) toggleBtn.style.display = 'flex';
    } else {
      if (toggleBtn) toggleBtn.style.display = 'none';
      closeBasket();
    }
  };

  const startBtns = [document.getElementById('start-now-ar'), document.getElementById('start-now-en')];
  startBtns.forEach(btn => {
    if (btn) btn.onclick = showCodeGate;
  });

  const activateBtns = [document.getElementById('activate-code-ar'), document.getElementById('activate-code-en')];
  activateBtns.forEach(btn => {
    if (btn) btn.onclick = () => validateCode(btn.id.includes('ar') ? 'ar' : 'en');
  });

  const noCodeBtns = [document.getElementById('no-code-btn-ar'), document.getElementById('no-code-btn-en')];
  noCodeBtns.forEach(btn => {
    if (btn) btn.onclick = () => {
      activatedGrant = null; // No code mode
      showCourseSelection(window.currentLang);
    };
  });

  const submitBtns = [document.getElementById('submit-registration-ar'), document.getElementById('submit-registration-en')];
  submitBtns.forEach(btn => {
    if (btn) btn.onclick = () => submitForm(btn.id.includes('ar') ? 'ar' : 'en');
  });

  const whatsappBtns = [document.getElementById('whatsapp-btn-ar'), document.getElementById('whatsapp-btn-en')];
  whatsappBtns.forEach(btn => {
    if (btn) btn.onclick = () => sendWhatsApp(btn.id.includes('ar') ? 'ar' : 'en');
  });

  // Watch for display changes to show/hide floating button
  const observer = new MutationObserver(checkBasketVisibility);
  const coursesSection = document.getElementById('course-selection-section');
  if (coursesSection) observer.observe(coursesSection, { attributes: true, attributeFilter: ['style'] });
}

function showCodeGate() {
  document.getElementById('welcome-hero-section').style.display = 'none';
  document.getElementById('code-gate-section').style.display = 'flex';
  window.scrollTo(0, 0);
}

function validateCode(lang) {
  const input = document.getElementById(`private-code-${lang}`);
  const error = document.getElementById(`code-error-${lang}`);
  const code = input.value.trim().toUpperCase();
  const codes = getCodes();

  if (!code) {
    showMessage(error, lang === 'ar' ? 'يرجى إدخال الكود' : 'Please enter the code');
    return;
  }

  if (codes[code]) {
    activatedGrant = { ...codes[code], code };
    showCourseSelection(lang);
  } else {
    showMessage(error, lang === 'ar' ? 'الكود غير صحيح' : 'Invalid code');
  }
}

function showCourseSelection(lang) {
  document.getElementById('code-gate-section').style.display = 'none';
  document.getElementById('course-selection-section').style.display = 'block';
  
  const grantTitleAr = document.getElementById('grant-name-display-ar');
  const grantTitleEn = document.getElementById('grant-name-display-en');
  
  if (activatedGrant) {
    grantTitleAr.parentElement.style.display = 'block';
    grantTitleEn.parentElement.style.display = 'block';
    grantTitleAr.textContent = activatedGrant.nameAr;
    grantTitleEn.textContent = activatedGrant.nameEn;
  } else {
    grantTitleAr.parentElement.style.display = 'none';
    grantTitleEn.parentElement.style.display = 'none';
  }

  renderCourses(lang);
  window.scrollTo(0, 0);
}

function renderCourses(lang) {
  const container = document.getElementById(`courses-grid-${lang}`);
  const courses = getCourses();
  container.innerHTML = '';

  courses.forEach(c => {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
      <div class="course-card-header">
        <span class="course-card-icon">${c.icon}</span>
        <input type="checkbox" class="course-card-checkbox" data-id="${c.id}">
      </div>
      <div class="course-card-title">${lang === 'ar' ? c.nameAr : c.nameEn}</div>
      <div class="course-card-benefit">${lang === 'ar' ? c.benefitAr : c.benefitEn}</div>
      <div style="margin-top: 15px;">
        <div class="course-card-price">${c.originalPrice} ${lang === 'ar' ? 'جنيه' : 'EGP'}</div>
        <div class="course-card-grant-price">${activatedGrant ? c.grantPrice : c.originalPrice} ${lang === 'ar' ? 'جنيه' : 'EGP'}</div>
      </div>
    `;

    const checkbox = card.querySelector('.course-card-checkbox');
    card.onclick = (e) => {
      if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
      card.classList.toggle('selected', checkbox.checked);
      updateSelection();
    };
    container.appendChild(card);
  });
}

function updateSelection() {
  const lang = window.currentLang;
  const checkboxes = document.querySelectorAll('.course-card-checkbox:checked');
  selectedCourses = Array.from(checkboxes).map(cb => {
    const id = parseInt(cb.dataset.id);
    return getCourses().find(c => c.id === id);
  });

  const continueBtn = document.getElementById(`continue-btn-${lang}`);
  if (continueBtn) {
    continueBtn.style.display = selectedCourses.length > 0 ? 'block' : 'none';
    continueBtn.onclick = () => showRegistrationForm(lang);
  }

  updateSmartBasket();
}

function updateSmartBasket() {
  const lang = window.currentLang;
  const basketItems = document.getElementById('basket-items');
  const basketFloatingCount = document.getElementById('basket-floating-count');
  const originalTotalEl = document.getElementById('basket-original-total');
  const discountRow = document.getElementById('basket-discount-row');
  const discountValEl = document.getElementById('basket-discount-val');
  const finalTotalEl = document.getElementById('basket-final-total');
  const inst1El = document.getElementById('basket-1st-inst');
  const inst2El = document.getElementById('basket-2nd-inst');

  if (basketFloatingCount) basketFloatingCount.textContent = selectedCourses.length;
  if (!basketItems) return;
  basketItems.innerHTML = '';

  let originalTotal = 0;
  let finalTotal = 0;

  selectedCourses.forEach(c => {
    const item = document.createElement('div');
    item.className = 'basket-item';
    const price = activatedGrant ? c.grantPrice : c.originalPrice;
    item.innerHTML = `
      <div class="basket-item-info">
        <span class="basket-item-name">${lang === 'ar' ? c.nameAr : c.nameEn}</span>
        <span class="basket-item-price">${price} ${lang === 'ar' ? 'جنيه' : 'EGP'}</span>
      </div>
      <button class="remove-item-btn" data-id="${c.id}" style="background:none; border:none; color:var(--primary-red); cursor:pointer; font-size:18px;">×</button>
    `;
    
    const removeBtn = item.querySelector('.remove-item-btn');
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      const courseId = parseInt(removeBtn.dataset.id);
      const checkbox = document.querySelector(`.course-card-checkbox[data-id="${courseId}"]`);
      if (checkbox) {
        checkbox.checked = false;
        checkbox.closest('.course-card').classList.remove('selected');
        updateSelection();
      }
    };

    basketItems.appendChild(item);
    originalTotal += c.originalPrice;
    finalTotal += price;
  });

  // Apply multi-course discount
  const discounts = getDiscounts();
  let multiDiscount = 0;
  if (discounts && discounts.multiCourse) {
    const sorted = [...discounts.multiCourse].sort((a, b) => b.count - a.count);
    const match = sorted.find(d => selectedCourses.length >= d.count);
    if (match) multiDiscount = match.discount;
  }

  finalTotal = Math.max(0, finalTotal - multiDiscount);

  if (multiDiscount > 0) {
    if (discountRow) discountRow.style.display = 'flex';
    if (discountValEl) discountValEl.textContent = `${multiDiscount} ${lang === 'ar' ? 'جنيه' : 'EGP'}`;
  } else {
    if (discountRow) discountRow.style.display = 'none';
  }

  // Installments: 200 per course (or final total if less)
  const inst1 = Math.min(finalTotal, selectedCourses.length * 200);
  const inst2 = Math.max(0, finalTotal - inst1);

  if (originalTotalEl) originalTotalEl.textContent = `${originalTotal} ${lang === 'ar' ? 'جنيه' : 'EGP'}`;
  if (finalTotalEl) finalTotalEl.textContent = `${finalTotal} ${lang === 'ar' ? 'جنيه' : 'EGP'}`;
  if (inst1El) inst1El.textContent = `${inst1} ${lang === 'ar' ? 'جنيه' : 'EGP'}`;
  if (inst2El) inst2El.textContent = `${inst2} ${lang === 'ar' ? 'جنيه' : 'EGP'}`;

  // Store totals for registration
  window.lastBasketTotals = { originalTotal, finalTotal, inst1, inst2, multiDiscount };
}

function showRegistrationForm(lang) {
  document.getElementById('course-selection-section').style.display = 'none';
  const smartBasket = document.getElementById('smart-basket');
  if (smartBasket) smartBasket.style.display = 'none';
  document.getElementById('registration-section').style.display = 'block';
  updateSummary(lang);
  window.scrollTo(0, 0);
}

function updateSummary(lang) {
  const summary = document.getElementById(`final-courses-${lang}`);
  const price = document.getElementById(`final-price-${lang}`);
  const totals = window.lastBasketTotals;
  
  const courseNames = selectedCourses.map(c => lang === 'ar' ? c.nameAr : c.nameEn).join(', ');
  if (summary) summary.textContent = courseNames;

  if (price) {
    price.innerHTML = `
      ${lang === 'ar' ? 'إجمالي السعر بعد الخصم' : 'Total Price after Discount'}: <strong>${totals.finalTotal} ${lang === 'ar' ? 'جنيه' : 'EGP'}</strong><br>
      <div style="margin-top:10px; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div style="background:#fff; padding:10px; border-radius:8px; border:1px solid #ddd;">
          <small>${lang === 'ar' ? 'القسط الأول' : '1st Installment'}</small><br>
          <strong>${totals.inst1} ${lang === 'ar' ? 'جنيه' : 'EGP'}</strong>
        </div>
        <div style="background:#fff; padding:10px; border-radius:8px; border:1px solid #ddd;">
          <small>${lang === 'ar' ? 'القسط الثاني' : '2nd Installment'}</small><br>
          <strong>${totals.inst2} ${lang === 'ar' ? 'جنيه' : 'EGP'}</strong>
        </div>
      </div>
    `;
  }
}

function submitForm(lang) {
  const name = document.getElementById(`full-name-${lang}`).value.trim();
  const phone = document.getElementById(`phone-${lang}`).value.trim();
  const age = document.getElementById(`age-${lang}`).value.trim();
  const error = document.getElementById(`form-error-${lang}`);
  const loadingOverlay = document.getElementById('loading-overlay');
  const formFields = document.getElementById(`form-fields-container-${lang}`);

  if (!name || !phone || !age) {
    showMessage(error, lang === 'ar' ? 'يرجى ملء جميع البيانات' : 'Please fill all fields');
    return;
  }

  // Generate unique code: First letter of grant code + 3 random digits
  const firstLetter = activatedGrant ? activatedGrant.code.charAt(0) : 'Z';
  const randomNum = Math.floor(100 + Math.random() * 900);
  const finalCode = `${firstLetter}.${randomNum}`;

  const regData = {
    fullName: name,
    phone: phone,
    age: age,
    finalCode: finalCode,
    selectedCourses: selectedCourses.map(c => c.nameEn),
    numCourses: selectedCourses.length,
    registrationDate: new Date().toISOString(),
    baseCode: activatedGrant ? activatedGrant.code : 'NONE',
    totals: window.lastBasketTotals
  };

  addRegistration(regData);
  window.currentReg = regData;

  // Hide the input fields
  if (formFields) formFields.style.display = 'none';

  // Show loading screen
  if (loadingOverlay) {
    loadingOverlay.classList.add('show');
  }

  setTimeout(() => {
    // Hide loading screen
    if (loadingOverlay) {
      loadingOverlay.classList.remove('show');
    }

    // Show final code container
    const codeDisplay = document.getElementById(`final-code-display-${lang}`);
    if (codeDisplay) {
      codeDisplay.textContent = finalCode;
    }
    
    const container = document.getElementById(`code-display-container-${lang}`);
    if (container) container.style.display = 'block';

    // Auto open WhatsApp
    sendWhatsApp(lang);
  }, 2500); // Optimized: 2.5 seconds loading
}

function sendWhatsApp(lang) {
  const reg = window.currentReg;
  const totals = reg.totals;
  const codes = getCodes();
  const targetPhone = activatedGrant ? codes[activatedGrant.code].whatsappNumber : '201029398592';
  
  // Expiry calculation (3 days from now)
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 3);
  
  const daysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const expiryDay = lang === 'ar' ? daysAr[expiryDate.getDay()] : daysEn[expiryDate.getDay()];
  const expiryFormatted = expiryDate.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');

  // Load template from settings
  const settings = getSettings();
  let template = lang === 'ar' ? settings.whatsappTemplateAr : settings.whatsappTemplateEn;
  
  // Replace variables
  const data = {
    name: reg.fullName,
    phone: reg.phone,
    age: reg.age,
    code: reg.finalCode,
    courses: reg.selectedCourses.join(', '),
    total: totals.finalTotal,
    inst1: totals.inst1,
    inst2: totals.inst2,
    expiryDay: expiryDay,
    expiryDate: expiryFormatted
  };

  Object.entries(data).forEach(([key, val]) => {
    template = template.replace(new RegExp(`{${key}}`, 'g'), val);
  });

  window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(template)}`, '_blank');
}

