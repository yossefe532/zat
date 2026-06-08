-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT DEFAULT '📚',
  original_price NUMERIC NOT NULL DEFAULT 3000,
  grant_price NUMERIC NOT NULL DEFAULT 650,
  details_ar TEXT[] DEFAULT '{}',
  details_en TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create grant_codes table
CREATE TABLE IF NOT EXISTS grant_codes (
  code TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER,
  courses JSONB NOT NULL DEFAULT '[]',
  total_price NUMERIC NOT NULL DEFAULT 0,
  first_installment NUMERIC DEFAULT 0,
  second_installment NUMERIC DEFAULT 0,
  registration_code TEXT NOT NULL UNIQUE,
  grant_code_used TEXT,
  whatsapp_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_phone ON registrations(phone);
CREATE INDEX IF NOT EXISTS idx_registrations_code ON registrations(registration_code);
CREATE INDEX IF NOT EXISTS idx_registrations_created ON registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grant_codes_active ON grant_codes(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Policies for registrations (public can insert, only authenticated can read all)
CREATE POLICY "Anyone can insert registrations" ON registrations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can read their own registration by phone" ON registrations
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can update their own registration" ON registrations
  FOR UPDATE TO anon, authenticated USING (true);

-- Policies for grant_codes (public can read active codes)
CREATE POLICY "Anyone can read active grant codes" ON grant_codes
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Anyone can insert grant codes" ON grant_codes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can update grant codes" ON grant_codes
  FOR UPDATE TO anon, authenticated USING (true);

-- Policies for courses (public can read)
CREATE POLICY "Anyone can read courses" ON courses
  FOR SELECT TO anon, authenticated USING (is_active = true);

-- Insert default courses
INSERT INTO courses (name_ar, name_en, icon, original_price, grant_price, details_ar, details_en) VALUES
  ('كورس إنجليزي', 'English Course', '🇬🇧', 3000, 650,
   ARRAY['إجمالي 32 ساعة دراسية', 'سيتم فتح التسجيل للدفعة الثانية', 'الكورس الأعلى إقبالاً'],
   ARRAY['Total 32 study hours', 'Registration for 2nd batch soon', 'Highest demand among all courses']),
  ('كورس ألماني', 'German Course', '🇩🇪', 3000, 650,
   ARRAY['إجمالي 20 ساعة دراسية', 'فتح التسجيل للدفعة الثانية', 'الأكثر إقبالاً من الكادر الطبي والتمريض'],
   ARRAY['Total 20 study hours', 'Registration for 2nd batch', 'Highest demand from medical staff']),
  ('كورس ICDL', 'ICDL Course', '💻', 3000, 650,
   ARRAY['إجمالي 16 ساعة دراسية', 'مستوى تعليم عالي الجودة', 'إتاحة حجز الاختبارات الدولية المعتمدة'],
   ARRAY['Total 16 study hours', 'High-quality education', 'Accredited international exams available']),
  ('كورس فوتوشوب', 'Photoshop Course', '🎬', 3000, 650,
   ARRAY['إجمالي 16 ساعة دراسية', 'نظام تعلم أوفلاين', 'أكثر من 10 تاسكات عملية تطبيقية'],
   ARRAY['Total 16 study hours', 'Offline learning system', 'More than 10 practical tasks']),
  ('موشن جرافيك', 'Motion Graphics', '🎨', 3000, 650,
   ARRAY['إجمالي 16 ساعة دراسية', 'مدرب دولي معتمد', 'مشروع تخرج تطبيقي في نهاية الكورس'],
   ARRAY['Total 16 study hours', 'Certified International Trainer', 'Applied graduation project']),
  ('البرمجة الأساسية', 'Basic Programming', '🌐', 3000, 650,
   ARRAY['إجمالي 16 ساعة دراسية', 'شرح أساسيات HTML و CSS', 'توفير أجهزة للتعلم لمن لا يملك'],
   ARRAY['Total 16 study hours', 'HTML & CSS basics', 'Devices provided for learners'])
ON CONFLICT DO NOTHING;

-- Insert default grant codes
INSERT INTO grant_codes (code, name_ar, name_en, whatsapp_number) VALUES
  ('Y.EDU', 'منحة يوسف', 'Yousef Grant', '201029398592'),
  ('S.EDU', 'منحة سما', 'Sama Grant', '201020408172'),
  ('H.E4U', 'منحة حبيبة', 'Habiba Grant', '201034434253'),
  ('MH.E4U', 'منحة محمود', 'Mahmoud Grant', '201022027996'),
  ('MT.E4U', 'منحة محمد ممدوح', 'Mohamed Mamdouh Grant', '201147691835')
ON CONFLICT (code) DO NOTHING;
