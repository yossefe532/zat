# نظام مبادرة ذات

تطبيق Next.js متكامل لإدارة تسجيل الطلاب بواسطة موظفي خدمة العملاء، مع لوحة مشرف، إرسال واتساب، سجل تدقيق، ونسخ احتياطية دورية.

## المسارات الرئيسية

- `/staff`: واجهة موظفي خدمة العملاء لتسجيل الطلاب، إنشاء الكود النهائي، تعديل الصلاحية، وإرسال الواتساب.
- `/admin`: لوحة المشرف لإدارة الموظفين، مراجعة الطلاب، متابعة السجلات، وتشغيل النسخ الاحتياطي.
- `/`: الواجهة الحالية للمبادرة ما زالت متاحة كما هي.

## إعداد البيئة

أنشئ ملف `.env.local` بالاعتماد على `.env.example` ثم أضف القيم التالية:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
AUTH_SECRET=
DATA_ENCRYPTION_KEY=
WASENDER_API_KEY=
WASENDER_API_BASE_URL=https://www.wasenderapi.com/api
WHATSAPP_TOKEN=
CRON_SECRET=
SITE_ACCESS_PASSWORD=
```

`SITE_ACCESS_PASSWORD` هي كلمة المرور العامة التي تحمي جميع الصفحات مثل `/` و`/staff` و`/admin`.

تكامل الواتساب الحالي يعمل مع `WasenderAPI`:

- ضع `WASENDER_API_KEY` أو `WHATSAPP_TOKEN` بنفس قيمة `API Access Token` من جلسة Wasender.
- اترك `WASENDER_API_BASE_URL` على القيمة الافتراضية إلا إذا كنت تستخدم عنوانًا مخصصًا.

## التشغيل

```bash
npm install
npm run dev
```

## فحوص الجودة

```bash
npm run check
npm run lint
npm run test
npm run build
```

## ما الذي تم بناؤه

- تشفير بيانات الطلاب والموظفين الحساسة عبر AES-GCM داخل الخادم.
- جلسات آمنة للمشرف والموظفين عبر جدول `auth_sessions` وملف تعريف ارتباط `httpOnly`.
- جداول مستقلة للموظفين، الطلاب، السجل الرقابي، والنسخ الاحتياطية.
- إرسال رسالة واتساب تلقائيًا تحتوي على الكود النهائي، الدورات، المبلغ، الصلاحية، وبيانات الموظف.
- تشغيل نسخة احتياطية يدوية أو دورية كل 6 ساعات عبر Vercel Cron.
