import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { registrantLoginSchema } from '@/lib/schemas';
import { buildRegistrationPhoneCandidates } from '@/lib/registration-booking';
import { normalizePhoneNumber } from '@/lib/utils';
import { requireServiceSupabaseClient } from '@/lib/server-supabase';

type RegistrationLoginRow = {
  id: string;
  full_name: string;
  phone: string;
  registration_code: string;
  grant_code_used: string | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      phone?: string;
      registrationCode?: string;
    };

    const parsed = registrantLoginSchema.parse(body);
    const normalizedPhone = normalizePhoneNumber(parsed.phone);
    const candidates = buildRegistrationPhoneCandidates(normalizedPhone);
    const supabase = requireServiceSupabaseClient();

    const { data, error } = await supabase
      .from('registrations')
      .select('id, full_name, phone, registration_code, grant_code_used')
      .in('phone', candidates)
      .eq('registration_code', parsed.registrationCode.trim())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    const record = (data?.[0] ?? null) as RegistrationLoginRow | null;

    if (!record || !record.grant_code_used) {
      return NextResponse.json({ success: false, message: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    await createSession({
      role: 'registrant',
      subjectId: record.id,
      registrationId: record.id,
      fullName: record.full_name,
    });

    return NextResponse.json({ success: true, role: 'registrant' });
  } catch (error) {
    return errorResponse(error);
  }
}

