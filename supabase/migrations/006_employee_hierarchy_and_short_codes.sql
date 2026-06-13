ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS parent_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS parent_employee_name TEXT,
  ADD COLUMN IF NOT EXISTS root_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS root_employee_name TEXT;

UPDATE public.employees
SET
  employee_number = UPPER(LEFT(REGEXP_REPLACE(employee_number, '[^A-Za-z0-9]', '', 'g'), 6)),
  staff_code = UPPER(LEFT(REGEXP_REPLACE(staff_code, '[^A-Za-z0-9]', '', 'g'), 6)),
  login_identifier = UPPER(LEFT(REGEXP_REPLACE(login_identifier, '[^A-Za-z0-9]', '', 'g'), 6));

UPDATE public.employees
SET
  root_employee_id = COALESCE(root_employee_id, id),
  root_employee_name = COALESCE(root_employee_name, full_name)
WHERE parent_employee_id IS NULL;

UPDATE public.employees child
SET
  root_employee_id = COALESCE(parent.root_employee_id, parent.id),
  root_employee_name = COALESCE(parent.root_employee_name, parent.full_name),
  parent_employee_name = COALESCE(child.parent_employee_name, parent.full_name)
FROM public.employees parent
WHERE child.parent_employee_id = parent.id;

UPDATE public.student_records
SET final_code = UPPER(LEFT(REGEXP_REPLACE(final_code, '[^A-Za-z0-9]', '', 'g'), 6));

UPDATE public.registrations
SET registration_code = UPPER(LEFT(REGEXP_REPLACE(registration_code, '[^A-Za-z0-9]', '', 'g'), 6));

ALTER TABLE public.employees
  DROP CONSTRAINT IF EXISTS employees_employee_number_length_check,
  DROP CONSTRAINT IF EXISTS employees_staff_code_length_check,
  DROP CONSTRAINT IF EXISTS employees_login_identifier_length_check;

ALTER TABLE public.student_records
  DROP CONSTRAINT IF EXISTS student_records_final_code_length_check;

ALTER TABLE public.registrations
  DROP CONSTRAINT IF EXISTS registrations_registration_code_length_check;

ALTER TABLE public.employees
  ADD CONSTRAINT employees_employee_number_length_check CHECK (char_length(employee_number) <= 6),
  ADD CONSTRAINT employees_staff_code_length_check CHECK (char_length(staff_code) <= 6),
  ADD CONSTRAINT employees_login_identifier_length_check CHECK (char_length(login_identifier) <= 6);

ALTER TABLE public.student_records
  ADD CONSTRAINT student_records_final_code_length_check CHECK (char_length(final_code) <= 6);

ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_registration_code_length_check CHECK (char_length(registration_code) <= 6);

CREATE INDEX IF NOT EXISTS idx_employees_parent_employee_id ON public.employees(parent_employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_root_employee_id ON public.employees(root_employee_id);
