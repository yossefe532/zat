export const COURSES = [
  { 
    id: 1, 
    nameAr: 'كورس إنجليزي', 
    nameEn: 'English Course', 
    icon: '🇬🇧', 
    level: 'A1-A2',
    benefitAr: 'تطوير مهارات التحدث والكتابة بشكل احترافي',
    benefitEn: 'Professional development of speaking and writing skills',
    detailsAr: ['إجمالي 32 ساعة دراسية', 'مناسب للمبتدئين', 'تطبيقات عملية ومتابعة مستمرة'],
    detailsEn: ['32 study hours total', 'Suitable for beginners', 'Practical exercises and continuous follow-up'],
    originalPrice: 3000,
    grantPrice: 675
  },
  { 
    id: 2, 
    nameAr: 'كورس ألماني', 
    nameEn: 'German Course', 
    icon: '🇩🇪', 
    level: 'A1.1',
    benefitAr: 'تعلم اللغة الألمانية من الصفر حتى المحادثة اليومية',
    benefitEn: 'Learn German from scratch to daily conversation',
    detailsAr: ['إجمالي 20 ساعة دراسية', 'أساسيات المحادثة اليومية', 'دعم خاص للكادر الطبي والطلاب'],
    detailsEn: ['20 study hours total', 'Daily conversation basics', 'Extra support for students and medical staff'],
    originalPrice: 3000,
    grantPrice: 675
  },
  { 
    id: 3, 
    nameAr: 'كورس ICDL', 
    nameEn: 'ICDL Course', 
    icon: '💻', 
    level: 'شهادة دولية',
    benefitAr: 'إتقان مهارات الحاسب الآلي والبرامج المكتبية الأساسية',
    benefitEn: 'Mastering computer skills and essential office programs',
    detailsAr: ['شرح عملي شامل', 'تجهيز لسوق العمل', 'إمكانية حجز الاختبارات المعتمدة'],
    detailsEn: ['Hands-on training', 'Prepared for the job market', 'Accredited exams can be booked'],
    originalPrice: 3000,
    grantPrice: 675
  },
  { 
    id: 4, 
    nameAr: 'موشن جرافيك', 
    nameEn: 'Motion Graphics', 
    icon: '🎬', 
    level: 'من الصفر',
    benefitAr: 'تحريك الرسوم وتصميم الفيديو والمونتاج الاحترافي',
    benefitEn: 'Animation, video design, and professional editing',
    detailsAr: ['مشاريع تطبيقية واقعية', 'تعلم المونتاج والتحريك', 'مناسب للمبتدئين'],
    detailsEn: ['Real applied projects', 'Editing and motion training', 'Suitable for beginners'],
    originalPrice: 3000,
    grantPrice: 675
  },
  { 
    id: 5, 
    nameAr: 'فوتوشوب', 
    nameEn: 'Photoshop', 
    icon: '🎨', 
    level: 'احترافي',
    benefitAr: 'احتراف برامج التصميم العالمية وتصميم الهويات البصرية',
    benefitEn: 'Mastering international design software and visual identity design',
    detailsAr: ['أساسيات وتطبيقات عملية', 'تصميم هويات وسوشيال ميديا', 'تدريب على مشاريع حقيقية'],
    detailsEn: ['Foundations and practical tasks', 'Branding and social media design', 'Training on real projects'],
    originalPrice: 3000,
    grantPrice: 675
  },
  { 
    id: 6, 
    nameAr: 'برمجة', 
    nameEn: 'Programming', 
    icon: '🌐', 
    level: 'تطوير ويب',
    benefitAr: 'بناء وتطوير المواقع الإلكترونية من البداية بشكل عملي',
    benefitEn: 'Practical building and development of websites from scratch',
    detailsAr: ['شرح HTML و CSS بشكل تطبيقي', 'إنشاء مشاريع حقيقية', 'مناسب لبداية المسار المهني'],
    detailsEn: ['Practical HTML and CSS', 'Build real projects', 'Great start for a tech career'],
    originalPrice: 3000,
    grantPrice: 675
  }
];

export const DEFAULT_GRANT_CODES = {
  'Y.EDU': {
    nameAr: 'منحة يوسف',
    nameEn: 'Yousef Grant',
    whatsappNumber: '201029398592',
    isActive: true
  },
  'S.EDU': {
    nameAr: 'منحة سما',
    nameEn: 'Sama Grant',
    whatsappNumber: '201020408172',
    isActive: true
  },
  'H.E4U': {
    nameAr: 'منحة حبيبة',
    nameEn: 'Habiba Grant',
    whatsappNumber: '201034434253',
    isActive: true
  },
  'MH.E4U': {
    nameAr: 'منحة محمود',
    nameEn: 'Mahmoud Grant',
    whatsappNumber: '201022027996',
    isActive: true
  },
  'MT.E4U': {
    nameAr: 'منحة محمد ممدوح',
    nameEn: 'Mohamed Mamdouh Grant',
    whatsappNumber: '201147691835',
    isActive: true
  }
};

export const ADMIN_FEES = 0;

export const DISCOUNT_RULES = [
  { count: 3, discount: 50 },
  { count: 5, discount: 100 }
];
