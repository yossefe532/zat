CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  whatsapp_encrypted TEXT NOT NULL,
  whatsapp_hash TEXT NOT NULL UNIQUE,
  whatsapp_last4 TEXT NOT NULL,
  staff_code TEXT NOT NULL UNIQUE,
  login_identifier TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  default_code_validity_days INTEGER NOT NULL DEFAULT 7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name_encrypted TEXT NOT NULL,
  full_name_hash TEXT NOT NULL,
  phone_encrypted TEXT NOT NULL,
  phone_hash TEXT NOT NULL,
  phone_last4 TEXT NOT NULL,
  study_level TEXT NOT NULL,
  age INTEGER NOT NULL,
  courses JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  final_code TEXT NOT NULL UNIQUE,
  code_validity_days INTEGER NOT NULL DEFAULT 7,
  code_expires_at TIMESTAMPTZ NOT NULL,
  employee_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  employee_number TEXT NOT NULL,
  whatsapp_sent_at TIMESTAMPTZ,
  whatsapp_delivery_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  subject_id TEXT NOT NULL,
  session_token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_role TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.backup_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL DEFAULT 'scheduled',
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_records_employee_id ON public.student_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_student_records_created_at ON public.student_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_records_final_code ON public.student_records(final_code);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token_hash ON public.auth_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON public.auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backup_snapshots_created_at ON public.backup_snapshots(created_at DESC);

DROP TRIGGER IF EXISTS trg_employees_updated_at ON public.employees;
CREATE TRIGGER trg_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_student_records_updated_at ON public.student_records;
CREATE TRIGGER trg_student_records_updated_at
BEFORE UPDATE ON public.student_records
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_snapshots ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.courses TO anon, authenticated;

REVOKE ALL ON public.employees FROM anon, authenticated;
REVOKE ALL ON public.student_records FROM anon, authenticated;
REVOKE ALL ON public.auth_sessions FROM anon, authenticated;
REVOKE ALL ON public.audit_logs FROM anon, authenticated;
REVOKE ALL ON public.backup_snapshots FROM anon, authenticated;
