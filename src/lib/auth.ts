import { cookies } from 'next/headers';
import { randomToken, signToken } from '@/lib/security';
import { requireServiceSupabaseClient } from '@/lib/server-supabase';

const SESSION_COOKIE = 'zat_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

type SessionRow = {
  id: string;
  role: 'admin' | 'employee' | 'registrant';
  subject_id: string;
  expires_at: string;
};

type EmployeeRow = {
  id: string;
  employee_number: string;
  full_name: string;
  staff_code: string;
  is_active: boolean;
};

type RegistrantRow = {
  id: string;
  full_name: string;
  grant_code_used: string | null;
};

export type SessionActor = {
  role: 'admin' | 'employee' | 'registrant';
  subjectId: string;
  employeeId?: string;
  employeeNumber?: string;
  fullName?: string;
  staffCode?: string;
  registrationId?: string;
};

async function getSessionToken() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function createSession(actor: SessionActor) {
  const token = randomToken(24);
  const tokenHash = signToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
  const supabase = requireServiceSupabaseClient();

  const { error } = await supabase.from('auth_sessions').insert([
    {
      role: actor.role,
      subject_id: actor.subjectId,
      session_token_hash: tokenHash,
      expires_at: expiresAt,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSession() {
  const token = await getSessionToken();
  const supabase = requireServiceSupabaseClient();

  if (token) {
    await supabase
      .from('auth_sessions')
      .delete()
      .eq('session_token_hash', signToken(token));
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 0,
  });
}

export async function getSessionActor(): Promise<SessionActor | null> {
  const token = await getSessionToken();

  if (!token) {
    return null;
  }

  const supabase = requireServiceSupabaseClient();
  const tokenHash = signToken(token);
  const { data: session, error } = await supabase
    .from('auth_sessions')
    .select('id, role, subject_id, expires_at')
    .eq('session_token_hash', tokenHash)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle<SessionRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!session) {
    return null;
  }

  if (session.role === 'admin') {
    return {
      role: 'admin',
      subjectId: session.subject_id,
      fullName: 'المشرف',
    };
  }

  if (session.role === 'registrant') {
    const { data: registrant, error: registrantError } = await supabase
      .from('registrations')
      .select('id, full_name, grant_code_used')
      .eq('id', session.subject_id)
      .maybeSingle<RegistrantRow>();

    if (registrantError) {
      throw new Error(registrantError.message);
    }

    if (!registrant || !registrant.grant_code_used) {
      return null;
    }

    return {
      role: 'registrant',
      subjectId: registrant.id,
      registrationId: registrant.id,
      fullName: registrant.full_name,
    };
  }

  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('id, employee_number, full_name, staff_code, is_active')
    .eq('id', session.subject_id)
    .maybeSingle<EmployeeRow>();

  if (employeeError) {
    throw new Error(employeeError.message);
  }

  if (!employee || !employee.is_active) {
    return null;
  }

  return {
    role: 'employee',
    subjectId: employee.id,
    employeeId: employee.id,
    employeeNumber: employee.employee_number,
    fullName: employee.full_name,
    staffCode: employee.staff_code,
  };
}

export async function requireSession(allowedRoles?: Array<'admin' | 'employee' | 'registrant'>) {
  const actor = await getSessionActor();

  if (!actor) {
    throw new Error('UNAUTHORIZED');
  }

  if (allowedRoles && !allowedRoles.includes(actor.role)) {
    throw new Error('FORBIDDEN');
  }

  return actor;
}
