// Default data
const DEFAULT_COURSES = [
  { 
    id: 1, 
    nameAr: 'كورس إنجليزي', 
    nameEn: 'English Course', 
    icon: '🇬🇧', 
    level: 'A1-A2',
    benefitAr: 'تطوير مهارات التحدث والكتابة بشكل احترافي',
    benefitEn: 'Professional development of speaking and writing skills',
    originalPrice: 3000,
    grantPrice: 650
  },
  { 
    id: 2, 
    nameAr: 'كورس ألماني', 
    nameEn: 'German Course', 
    icon: '🇩🇪', 
    level: 'A1.1',
    benefitAr: 'تعلم اللغة الألمانية من الصفر حتى المحادثة اليومية',
    benefitEn: 'Learn German from scratch to daily conversation',
    originalPrice: 3000,
    grantPrice: 650
  },
  { 
    id: 3, 
    nameAr: 'كورس ICDL', 
    nameEn: 'ICDL Course', 
    icon: '💻', 
    level: 'شهادة دولية',
    benefitAr: 'إتقان مهارات الحاسب الآلي والبرامج المكتبية الأساسية',
    benefitEn: 'Mastering computer skills and essential office programs',
    originalPrice: 3000,
    grantPrice: 650
  },
  { 
    id: 4, 
    nameAr: 'موشن جرافيك', 
    nameEn: 'Motion Graphics', 
    icon: '🎬', 
    level: 'من الصفر',
    benefitAr: 'تحريك الرسوم وتصميم الفيديو والمونتاج الاحترافي',
    benefitEn: 'Animation, video design, and professional editing',
    originalPrice: 3000,
    grantPrice: 650
  },
  { 
    id: 5, 
    nameAr: 'جرافيك ديزاين', 
    nameEn: 'Graphic Design', 
    icon: '🎨', 
    level: 'احترافي',
    benefitAr: 'احتراف برامج التصميم العالمية وتصميم الهويات البصرية',
    benefitEn: 'Mastering international design software and visual identity design',
    originalPrice: 3000,
    grantPrice: 650
  },
  { 
    id: 6, 
    nameAr: 'برمجة HTML & CSS', 
    nameEn: 'HTML & CSS Programming', 
    icon: '🌐', 
    level: 'تطوير ويب',
    benefitAr: 'بناء وتطوير المواقع الإلكترونية من البداية بشكل عملي',
    benefitEn: 'Practical building and development of websites from scratch',
    originalPrice: 3000,
    grantPrice: 650
  }
];

const ADMIN_FEES = 25;

const DEFAULT_CODES = {
  'Y.EDU': {
    nameAr: 'منحة يوسف',
    nameEn: 'Yousef Grant',
    whatsappNumber: '201029398592'
  },
  'S.EDU': {
    nameAr: 'منحة سما',
    nameEn: 'Sama Grant',
    whatsappNumber: '201020408172'
  }
};

const DEFAULT_DISCOUNTS = {
  multiCourse: [
    { count: 3, discount: 50 },
    { count: 5, discount: 100 }
  ],
  custom: []
};

const DEFAULT_SETTINGS = {
  whatsappTemplateAr: `مرحباً، أرغب في تأكيد الحجز:
الاسم: {name}
الهاتف: {phone}
العمر: {age}
الكود: {code}
الكورسات: {courses}

التفاصيل الحسابية:
- الإجمالي النهائي: {total} جنيه
- القسط الأول (يُدفع الآن): {inst1} جنيه
- القسط الثاني (المتبقي): {inst2} جنيه

⚠️ صلاحية الكود: هذا الكود صالح لمدة 3 أيام فقط، وينتهي بحلول يوم {expiryDay} الموافق {expiryDate}.`,
  whatsappTemplateEn: `Hello, I'd like to confirm my registration:
Name: {name}
Phone: {phone}
Age: {age}
Code: {code}
Courses: {courses}

Payment Details:
- Final Total: {total} EGP
- 1st Installment (Pay Now): {inst1} EGP
- 2nd Installment (Remaining): {inst2} EGP

⚠️ Code Validity: This code is valid for 3 days only, expiring on {expiryDay}, {expiryDate}.`,
  layoutPositions: {}
};

// Persistence
export const getCourses = () => {
  const saved = localStorage.getItem('zat_courses');
  return saved ? JSON.parse(saved) : DEFAULT_COURSES;
};

export const saveCourses = (courses) => {
  localStorage.setItem('zat_courses', JSON.stringify(courses));
};

export const getDiscounts = () => {
  const saved = localStorage.getItem('zat_discounts');
  return saved ? JSON.parse(saved) : DEFAULT_DISCOUNTS;
};

export const saveDiscounts = (discounts) => {
  localStorage.setItem('zat_discounts', JSON.stringify(discounts));
};

export const getSettings = () => {
  const saved = localStorage.getItem('zat_settings');
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

export const saveSettings = (settings) => {
  localStorage.setItem('zat_settings', JSON.stringify(settings));
};

export const getCodes = () => {
  const saved = localStorage.getItem('zat_codes');
  return saved ? JSON.parse(saved) : DEFAULT_CODES;
};

export const saveCodes = (codes) => {
  localStorage.setItem('zat_codes', JSON.stringify(codes));
};

export const getRegistrations = () => {
  const saved = localStorage.getItem('zat_registrations');
  return saved ? JSON.parse(saved) : [];
};

export const addRegistration = (reg) => {
  const regs = getRegistrations();
  regs.push(reg);
  localStorage.setItem('zat_registrations', JSON.stringify(regs));
};
