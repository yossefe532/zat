// Default data
const DEFAULT_COURSES = [
  { 
    id: 1, 
    nameAr: 'إنجليزي - A1', 
    nameEn: 'English – A1', 
    icon: '🇬🇧', 
    level: 'A1',
    benefitAr: 'مبتدئ جداً - تعلّم أساسيات اللغة: كلمات، جمل، محادثات بسيطة',
    benefitEn: 'Absolute beginner - Learn language basics: words, sentences, simple conversations',
    originalPrice: 1500,
    grantPrice: 350
  },
  { 
    id: 2, 
    nameAr: 'ألماني – A1.1', 
    nameEn: 'German – A1.1', 
    icon: '🇩🇪', 
    level: 'A1.1',
    benefitAr: 'مبتدئين من الصفر - تعلّم المفردات، المحادثات اليومية، والنطق الصحيح',
    benefitEn: 'Beginners from scratch - Learn vocabulary, daily conversations, and correct pronunciation',
    originalPrice: 1500,
    grantPrice: 350
  },
  { 
    id: 3, 
    nameAr: 'ICDL', 
    nameEn: 'ICDL', 
    icon: '💻', 
    level: 'شهادة دولية',
    benefitAr: 'تعلّم مهارات الكمبيوتر الأساسية - Microsoft Office والبرامج الضرورية',
    benefitEn: 'Learn essential computer skills - Microsoft Office and necessary programs',
    originalPrice: 1500,
    grantPrice: 350
  },
  { 
    id: 4, 
    nameAr: 'Photoshop', 
    nameEn: 'Photoshop', 
    icon: '🎨', 
    level: 'من الصفر',
    benefitAr: 'تعديل الصور، الألوان، الطبقات، والإخراج النهائي الاحترافي',
    benefitEn: 'Image editing, colors, layers, and professional final output',
    originalPrice: 1500,
    grantPrice: 350
  },
  { 
    id: 5, 
    nameAr: 'الذكاء الاصطناعي AI', 
    nameEn: 'Artificial Intelligence AI', 
    icon: '🤖', 
    level: 'حديث',
    benefitAr: 'تطبيقات AI في الأعمال، التسويق، الإبداع والتقنيات الحديثة',
    benefitEn: 'AI applications in business, marketing, creativity and modern technology',
    originalPrice: 1500,
    grantPrice: 350
  },
  { 
    id: 6, 
    nameAr: 'أساسيات البرمجة + HTML و CSS', 
    nameEn: 'Programming Basics + HTML & CSS', 
    icon: '👨‍💻', 
    level: 'من الصفر',
    benefitAr: 'تصميم مواقع ويب من البداية حتى الاحتراف - كود نظيف وعملي',
    benefitEn: 'Design websites from beginner to professional - clean and practical code',
    originalPrice: 1500,
    grantPrice: 350
  },
  { 
    id: 7, 
    nameAr: 'Premiere', 
    nameEn: 'Premiere', 
    icon: '🎬', 
    level: 'من الصفر',
    benefitAr: 'المونتاج الاحترافي - مؤثرات، صوت، عناوين، وتصدير عالي الجودة',
    benefitEn: 'Professional editing - effects, audio, titles, and high-quality export',
    originalPrice: 1500,
    grantPrice: 350
  },
  { 
    id: 8, 
    nameAr: 'Motion Level 1', 
    nameEn: 'Motion Level 1', 
    icon: '🎞️', 
    level: 'المستوى الأول',
    benefitAr: 'أساسيات التحريك والموشن جرافيك - تحريك العناصر البسيطة',
    benefitEn: 'Motion graphics basics - animating simple elements',
    originalPrice: 1500,
    grantPrice: 350
  },
  { 
    id: 9, 
    nameAr: 'Motion Level 2', 
    nameEn: 'Motion Level 2', 
    icon: '🎥', 
    level: 'متقدم',
    benefitAr: 'تحريك متقدم - الشخصيات، التفاصيل المعقدة، والتحريك الاحترافي',
    benefitEn: 'Advanced animation - characters, complex details, professional animation',
    originalPrice: 1500,
    grantPrice: 350
  },
  { 
    id: 10, 
    nameAr: 'Canva + Whiteboard', 
    nameEn: 'Canva + Whiteboard', 
    icon: '📊', 
    level: 'تدريس حديث',
    benefitAr: 'نظام تدريس احترافي - عروض، فيديوهات، وشرائح تعليمية مميزة',
    benefitEn: 'Professional teaching system - presentations, videos, and distinctive educational slides',
    originalPrice: 1500,
    grantPrice: 350
  }
];

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
