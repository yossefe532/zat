import { getCourses, saveCourses, getCodes, saveCodes, getRegistrations, getDiscounts, saveDiscounts, getSettings, saveSettings } from './data.js';

export function openAdminPanel() {
  const adminHTML = `
    <div id="admin-panel" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; overflow-y: auto; padding: 20px; font-family: 'Cairo', sans-serif;" dir="rtl">
      <div style="background: white; max-width: 900px; margin: 0 auto; border-radius: 15px; padding: 30px; position: relative;">
        <button id="close-admin" style="position: absolute; top: 20px; left: 20px; border: none; background: #eee; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 20px;">×</button>
        <h1 style="color: var(--primary-red); margin-bottom: 30px; text-align: center;">لوحة التحكم (Admin)</h1>
        
        <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
          <button class="admin-tab-btn active" data-tab="courses" style="padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; background: var(--primary-red); color: white;">الكورسات</button>
          <button class="admin-tab-btn" data-tab="codes" style="padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; background: #eee;">الأكواد</button>
          <button class="admin-tab-btn" data-tab="discounts" style="padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; background: #eee;">الخصومات</button>
          <button class="admin-tab-btn" data-tab="settings" style="padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; background: #eee;">الإعدادات</button>
          <button class="admin-tab-btn" data-tab="regs" style="padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; background: #eee;">المسجلين</button>
        </div>

        <div id="admin-tab-content">
          <!-- Content will be injected here -->
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', adminHTML);
  
  const closeBtn = document.getElementById('close-admin');
  closeBtn.onclick = () => document.getElementById('admin-panel').remove();

  const tabs = document.querySelectorAll('.admin-tab-btn');
  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.style.background = '#eee';
        t.style.color = '#000';
      });
      tab.classList.add('active');
      tab.style.background = 'var(--primary-red)';
      tab.style.color = 'white';
      renderTabContent(tab.dataset.tab);
    };
  });

  renderTabContent('courses');
}

function renderTabContent(tab) {
  const container = document.getElementById('admin-tab-content');
  if (tab === 'courses') {
    const courses = getCourses();
    container.innerHTML = `
      <h3>إدارة الكورسات</h3>
      <div style="display: grid; gap: 15px; margin-top: 20px;">
        ${courses.map((c, i) => `
          <div style="border: 1px solid #ddd; padding: 15px; border-radius: 10px;">
            <input type="text" value="${c.nameAr}" onchange="updateCourse(${i}, 'nameAr', this.value)" style="width: 48%; padding: 8px; margin-bottom: 5px;" placeholder="الاسم بالعربي">
            <input type="text" value="${c.nameEn}" onchange="updateCourse(${i}, 'nameEn', this.value)" style="width: 48%; padding: 8px; margin-bottom: 5px;" placeholder="Name in English">
            <input type="number" value="${c.originalPrice}" onchange="updateCourse(${i}, 'originalPrice', this.value)" style="width: 48%; padding: 8px;" placeholder="السعر الأصلي">
            <input type="number" value="${c.grantPrice}" onchange="updateCourse(${i}, 'grantPrice', this.value)" style="width: 48%; padding: 8px;" placeholder="سعر المنحة">
          </div>
        `).join('')}
      </div>
    `;
  } else if (tab === 'codes') {
    const codes = getCodes();
    container.innerHTML = `
      <h3>إدارة الأكواد</h3>
      <div style="margin-top: 20px;">
        <div id="codes-list">
          ${Object.entries(codes).map(([code, data]) => `
            <div style="border: 1px solid #ddd; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
              <strong>الكود: ${code}</strong><br>
              الاسم: <input type="text" value="${data.nameAr}" onchange="updateCode('${code}', 'nameAr', this.value)" style="padding: 5px; margin: 5px;"><br>
              واتساب: <input type="text" value="${data.whatsappNumber}" onchange="updateCode('${code}', 'whatsappNumber', this.value)" style="padding: 5px; margin: 5px;">
              <button onclick="deleteCode('${code}')" style="background: red; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">حذف</button>
            </div>
          `).join('')}
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 10px;">
          <h4>إضافة كود جديد</h4>
          <input type="text" id="new-code-key" placeholder="الكود (مثال: X.EDU)" style="padding: 8px; margin: 5px;">
          <input type="text" id="new-code-name" placeholder="اسم المنحة" style="padding: 8px; margin: 5px;">
          <input type="text" id="new-code-wa" placeholder="رقم الواتساب (201...)" style="padding: 8px; margin: 5px;">
          <button onclick="addNewCode()" style="background: green; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">إضافة</button>
        </div>
      </div>
    `;
  } else if (tab === 'discounts') {
    const discounts = getDiscounts();
    container.innerHTML = `
      <h3>إدارة الخصومات</h3>
      <div style="margin-top: 20px;">
        <h4>خصومات تعدد الكورسات</h4>
        <div id="multi-discounts-list">
          ${discounts.multiCourse.map((d, i) => `
            <div style="border: 1px solid #ddd; padding: 10px; border-radius: 8px; margin-bottom: 10px;">
              عند شراء <input type="number" value="${d.count}" onchange="updateMultiDiscount(${i}, 'count', this.value)" style="width: 60px; padding: 5px;"> كورسات أو أكثر، اخصم <input type="number" value="${d.discount}" onchange="updateMultiDiscount(${i}, 'discount', this.value)" style="width: 80px; padding: 5px;"> جنيه.
              <button onclick="deleteMultiDiscount(${i})" style="background: red; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">حذف</button>
            </div>
          `).join('')}
        </div>
        <button onclick="addMultiDiscount()" style="background: blue; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin-top: 10px;">إضافة قاعدة خصم</button>
      </div>
    `;
  } else if (tab === 'settings') {
    const settings = getSettings();
    container.innerHTML = `
      <h3>إعدادات الرسائل والموقع</h3>
      <div style="margin-top: 20px;">
        <h4>تعديل رسالة واتساب (عربي)</h4>
        <p style="font-size: 12px; color: #666;">المتغيرات المتاحة: {name}, {phone}, {age}, {code}, {courses}, {total}, {inst1}, {inst2}, {expiryDay}, {expiryDate}</p>
        <textarea id="wa-template-ar" style="width: 100%; height: 150px; padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-family: sans-serif;">${settings.whatsappTemplateAr}</textarea>
        
        <h4 style="margin-top: 20px;">تعديل رسالة واتساب (English)</h4>
        <textarea id="wa-template-en" style="width: 100%; height: 150px; padding: 10px; border-radius: 8px; border: 1px solid #ddd; font-family: sans-serif;">${settings.whatsappTemplateEn}</textarea>
        
        <button onclick="saveAdminSettings()" style="background: green; color: white; border: none; padding: 10px 25px; border-radius: 8px; cursor: pointer; margin-top: 20px; font-weight: bold; width: 100%;">حفظ الإعدادات</button>
        
        <hr style="margin: 30px 0;">
        
        <h4>تخصيص أماكن العناصر</h4>
        <button id="toggle-layout-mode" onclick="toggleLayoutMode()" style="background: #333; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; width: 100%;">تفعيل وضع تحريك العناصر ⚙️</button>
        <p style="font-size: 12px; color: #ef6c00; margin-top: 10px;">عند تفعيل هذا الوضع، يمكنك سحب العناصر (العناوين، البطاقات، الأزرار) لوضعها في أي مكان. يتم الحفظ تلقائياً.</p>
      </div>
    `;
  } else if (tab === 'regs') {
    const regs = getRegistrations();
    const courses = getCourses();
    
    const stats = courses.map(c => ({
      name: c.nameAr,
      count: regs.filter(r => r.selectedCourses.includes(c.nameEn)).length
    }));

    container.innerHTML = `
      <h3>إحصائيات الكورسات</h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 30px;">
        ${stats.map(s => `
          <div style="background: #f0f0f0; padding: 10px 20px; border-radius: 20px;">
            <strong>${s.name}:</strong> ${s.count}
          </div>
        `).join('')}
      </div>
      <h3>قائمة المسجلين (${regs.length})</h3>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead style="background: #eee;">
            <tr>
              <th style="padding: 10px; border: 1px solid #ddd;">الاسم</th>
              <th style="padding: 10px; border: 1px solid #ddd;">الكود النهائي</th>
              <th style="padding: 10px; border: 1px solid #ddd;">الإجمالي</th>
              <th style="padding: 10px; border: 1px solid #ddd;">الكورسات</th>
              <th style="padding: 10px; border: 1px solid #ddd;">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            ${regs.reverse().map(r => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${r.fullName}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${r.finalCode}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${r.totals ? r.totals.finalTotal : 'N/A'} ج.م</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${r.numCourses}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${new Date(r.registrationDate).toLocaleDateString('ar-EG')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

// Global functions for admin actions
window.updateCourse = (index, field, value) => {
  const courses = getCourses();
  courses[index][field] = field.includes('Price') ? parseFloat(value) : value;
  saveCourses(courses);
};

window.updateCode = (code, field, value) => {
  const codes = getCodes();
  codes[code][field] = value;
  saveCodes(codes);
};

window.updateMultiDiscount = (index, field, value) => {
  const discounts = getDiscounts();
  discounts.multiCourse[index][field] = parseInt(value);
  saveDiscounts(discounts);
};

window.deleteMultiDiscount = (index) => {
  const discounts = getDiscounts();
  discounts.multiCourse.splice(index, 1);
  saveDiscounts(discounts);
  renderTabContent('discounts');
};

window.addMultiDiscount = () => {
  const discounts = getDiscounts();
  discounts.multiCourse.push({ count: 1, discount: 0 });
  saveDiscounts(discounts);
  renderTabContent('discounts');
};

window.saveAdminSettings = () => {
  const settings = getSettings();
  settings.whatsappTemplateAr = document.getElementById('wa-template-ar').value;
  settings.whatsappTemplateEn = document.getElementById('wa-template-en').value;
  saveSettings(settings);
  alert('تم حفظ الإعدادات بنجاح');
};

window.toggleLayoutMode = () => {
  const btn = document.getElementById('toggle-layout-mode');
  const isEnabled = btn.dataset.enabled === 'true';
  const elements = document.querySelectorAll('.hero-title, .hero-subtitle, .section-title, .grant-box, .course-card, .btn');

  if (!isEnabled) {
    btn.textContent = 'إيقاف وضع التحريك وحفظ الأماكن 💾';
    btn.style.background = 'green';
    btn.dataset.enabled = 'true';
    elements.forEach(el => {
      el.classList.add('admin-editable');
      el.setAttribute('draggable', 'true');
      el.addEventListener('dragstart', handleDragStart);
      el.addEventListener('dragend', handleDragEnd);
    });
    document.getElementById('admin-panel').style.opacity = '0.3';
    document.getElementById('admin-panel').style.pointerEvents = 'none';
    // Create a small float button to stop mode
    const stopBtn = document.createElement('button');
    stopBtn.id = 'stop-layout-float';
    stopBtn.innerHTML = '💾 حفظ المواقع وإغلاق الوضع';
    stopBtn.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); z-index:20000; padding:15px 30px; background:green; color:white; border:none; border-radius:50px; font-weight:bold; cursor:pointer; box-shadow:0 5px 15px rgba(0,0,0,0.3);';
    stopBtn.onclick = () => {
      window.toggleLayoutMode();
      stopBtn.remove();
    };
    document.body.appendChild(stopBtn);
  } else {
    btn.textContent = 'تفعيل وضع تحريك العناصر ⚙️';
    btn.style.background = '#333';
    btn.dataset.enabled = 'false';
    elements.forEach(el => {
      el.classList.remove('admin-editable');
      el.removeAttribute('draggable');
    });
    document.getElementById('admin-panel').style.opacity = '1';
    document.getElementById('admin-panel').style.pointerEvents = 'all';
  }
};

function handleDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.id || e.target.className);
  e.target.style.opacity = '0.5';
}

function handleDragEnd(e) {
  e.target.style.opacity = '1';
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX;
  const y = e.clientY;
  
  e.target.style.position = 'fixed';
  e.target.style.left = x + 'px';
  e.target.style.top = y + 'px';
  e.target.style.margin = '0';
  e.target.style.zIndex = '1000';

  // Save position
  const settings = getSettings();
  const id = e.target.id || e.target.className.split(' ')[0];
  settings.layoutPositions[id] = { left: e.target.style.left, top: e.target.style.top };
  saveSettings(settings);
}

export function applySavedLayout() {
  const settings = getSettings();
  Object.entries(settings.layoutPositions).forEach(([id, pos]) => {
    const el = document.getElementById(id) || document.querySelector('.' + id);
    if (el) {
      el.style.position = 'fixed';
      el.style.left = pos.left;
      el.style.top = pos.top;
      el.style.margin = '0';
    }
  });
}

window.deleteCode = (code) => {
  if (confirm(`هل أنت متأكد من حذف الكود ${code}؟`)) {
    const codes = getCodes();
    delete codes[code];
    saveCodes(codes);
    renderTabContent('codes');
  }
};

window.addNewCode = () => {
  const key = document.getElementById('new-code-key').value.trim().toUpperCase();
  const name = document.getElementById('new-code-name').value.trim();
  const wa = document.getElementById('new-code-wa').value.trim();
  
  if (!key || !name || !wa) {
    alert('يرجى ملء جميع الحقول');
    return;
  }
  
  const codes = getCodes();
  codes[key] = { nameAr: name, nameEn: name, whatsappNumber: wa };
  saveCodes(codes);
  renderTabContent('codes');
};
