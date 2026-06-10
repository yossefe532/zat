INSERT INTO public.grant_codes (code, name_ar, name_en, whatsapp_number, is_active)
VALUES
  ('MT.E4U', 'منحة محمد ممدوح', 'Mohamed Mamdouh Grant', '201147691835', true),
  ('Y.E4U', 'منحة يوسف', 'Yousef Grant', '201029398592', true)
ON CONFLICT (code) DO UPDATE
SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  whatsapp_number = EXCLUDED.whatsapp_number,
  is_active = EXCLUDED.is_active;
