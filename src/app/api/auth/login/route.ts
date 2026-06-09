import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { adminLoginSchema, employeeLoginSchema } from '@/lib/schemas';
import { verifyPassword } from '@/lib/security';
import { requireServiceSupabaseClient } from '@/lib/server-supabase';

type EmployeeLoginRow = {
  id: string;
  employee_number: string;
  full_name: string;
  staff_code: string;
  password_hash: string;
  is_active: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      role?: 'admin' | 'employee';
      password?: string;
      loginIdentifier?: string;
    };

    if (body.role === 'admin') {
      const parsed = adminLoginSchema.parse(body);
      const expectedPassword = process.env.ADMIN_PASSWORD;

      if (!expectedPassword || parsed.password !== expectedPassword) {
        return NextResponse.json({ success: false, message: 'بيانات الدخول غير صحيحة' }, { status: 401 });
      }

      await createSession({
        role: 'admin',
        subjectId: 'env-admin',
        fullName: 'المشرف',
      });

      return NextResponse.json({ success: true, role: 'admin' });
    }

    const parsed = employeeLoginSchema.parse(body);
    const supabase = requireServiceSupabaseClient();
    const { data, error } = await supabase
      .from('employees')
      .select('id, employee_number, full_name, staff_code, password_hash, is_active')
      .eq('login_identifier', parsed.loginIdentifier)
      .maybeSingle<EmployeeLoginRow>();

    if (error) {
      throw new Error(error.message);
    }

    if (!data || !data.is_active || !verifyPassword(parsed.password, data.password_hash)) {
      return NextResponse.json({ success: false, message: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    await createSession({
      role: 'employee',
      subjectId: data.id,
      employeeId: data.id,
      employeeNumber: data.employee_number,
      fullName: data.full_name,
      staffCode: data.staff_code,
    });

    return NextResponse.json({ success: true, role: 'employee' });
  } catch (error) {
    return errorResponse(error);
  }
}
