CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS referral_code_used TEXT,
ADD COLUMN IF NOT EXISTS referral_discount_applied NUMERIC NOT NULL DEFAULT 0;

ALTER TABLE public.auth_sessions
DROP CONSTRAINT IF EXISTS auth_sessions_role_check;

ALTER TABLE public.auth_sessions
ADD CONSTRAINT auth_sessions_role_check
CHECK (role IN ('admin', 'employee', 'registrant'));

CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  owner_registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  root_referral_code TEXT NOT NULL,
  root_grant_code_used TEXT NOT NULL,
  root_whatsapp_number TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_owner ON public.referral_codes(owner_registration_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_root ON public.referral_codes(root_referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON public.referral_codes(is_active) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS public.referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_used TEXT NOT NULL REFERENCES public.referral_codes(code) ON DELETE RESTRICT,
  root_referral_code TEXT NOT NULL,
  owner_registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  referred_registration_id UUID NOT NULL UNIQUE REFERENCES public.registrations(id) ON DELETE CASCADE,
  applied_discount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_events_owner ON public.referral_events(owner_registration_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_root ON public.referral_events(root_referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_events_created ON public.referral_events(created_at DESC);

CREATE TABLE IF NOT EXISTS public.referral_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  milestone INTEGER NOT NULL,
  benefit_type TEXT NOT NULL CHECK (benefit_type IN ('discount_total', 'free_course')),
  benefit_value NUMERIC NOT NULL DEFAULT 0,
  is_consumed BOOLEAN NOT NULL DEFAULT false,
  consumed_registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consumed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referral_benefits_owner ON public.referral_benefits(owner_registration_id);
CREATE INDEX IF NOT EXISTS idx_referral_benefits_active ON public.referral_benefits(owner_registration_id, is_consumed);

CREATE TABLE IF NOT EXISTS public.referral_redemption_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  milestone INTEGER NOT NULL,
  target_whatsapp_number TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'sent', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_redemption_owner ON public.referral_redemption_requests(owner_registration_id);
CREATE INDEX IF NOT EXISTS idx_referral_redemption_created ON public.referral_redemption_requests(created_at DESC);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_redemption_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.referral_codes FROM anon, authenticated;
REVOKE ALL ON public.referral_events FROM anon, authenticated;
REVOKE ALL ON public.referral_benefits FROM anon, authenticated;
REVOKE ALL ON public.referral_redemption_requests FROM anon, authenticated;
