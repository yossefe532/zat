ALTER TABLE public.referral_benefits
DROP CONSTRAINT IF EXISTS referral_benefits_benefit_type_check;

ALTER TABLE public.referral_benefits
ADD CONSTRAINT referral_benefits_benefit_type_check
CHECK (benefit_type IN ('discount_total', 'free_course', 'perk'));

UPDATE public.referral_benefits
SET benefit_value = 1
WHERE benefit_type = 'free_course' AND benefit_value = 0;

