# وثيقة العمارة التقنية (Technical Architecture) - نظام مبادرة ذات 2026

## 1. المكدس التقني (Tech Stack)

### الواجهة الأمامية (Frontend)
- **Framework:** Next.js 14+ (App Router) لضمان السرعة وأفضل ممارسات SEO.
- **Styling:** Tailwind CSS لتصميم عصري وسريع الاستجابة.
- **Icons:** Lucide React لمجموعة أيقونات نظيفة واحترافية.
- **Animations:** Framer Motion لتجربة مستخدم سلسة وحركات جذابة.

### الواجهة الخلفية وقاعدة البيانات (Backend & Database)
- **Provider:** Supabase (PostgreSQL) كقاعدة بيانات سحابية.
- **Auth:** Supabase Auth لإدارة دخول المسؤولين.
- **API:** Next.js Server Actions للتعامل الآمن مع البيانات بين Frontend و Backend.
- **Storage:** Supabase Storage (إذا احتجنا لرفع صور أو ملفات).

## 2. تصميم قاعدة البيانات (Schema Design)

### جدول `registrations`
- `id`: UUID (Primary Key)
- `full_name`: Text
- `phone`: Text (Index)
- `age`: Integer
- `courses`: JSONB (قائمة الكورسات المختارة وتفاصيلها)
- `total_price`: Decimal
- `first_installment`: Decimal
- `second_installment`: Decimal
- `registration_code`: Text (Unique)
- `grant_code_used`: Text (Foreign Key)
- `created_at`: Timestamp

### جدول `grant_codes`
- `code`: Text (Primary Key)
- `name_ar`: Text
- `name_en`: Text
- `whatsapp_number`: Text
- `is_active`: Boolean
- `created_at`: Timestamp

### جدول `courses` (اختياري للإدارة الديناميكية)
- `id`: Serial
- `name_ar`: Text
- `name_en`: Text
- `original_price`: Decimal
- `grant_price`: Decimal
- `icon`: Text

## 3. معايير الأمان (Security)
- **Row Level Security (RLS):** منع الوصول المباشر لبيانات التسجيلات إلا للمسؤولين المصرح لهم.
- **Environment Variables:** حماية مفاتيح API في ملفات `.env`.
- **Validation:** استخدام مكتبة `Zod` للتحقق من صحة البيانات المدخلة قبل حفظها.

## 4. استراتيجية النشر (Deployment Strategy)
- **Hosting:** Vercel أو Netlify لضمان استقرار الموقع وسرعة استجابته عالمياً.
- **CI/CD:** النشر التلقائي عند دفع التحديثات لـ GitHub.
- **Parallel Development:** سيتم العمل في مجلد جديد أو فرع (Branch) منفصل لضمان عدم التأثير على `index.html` الحالي.

## 5. التبديل (Migration Plan)
1. إعداد مشروع Next.js في جذر المستودع.
2. نقل منطق `index.html` إلى مكونات React.
3. ربط النماذج بـ Supabase.
4. بعد التأكد من الجودة، يتم استبدال ملف `index.html` بملفات المشروع الجديد عند النشر.
