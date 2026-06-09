import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { createEmployee, listEmployees } from '@/lib/portal';
import { createEmployeeSchema } from '@/lib/schemas';

export async function GET() {
  try {
    await requireSession(['admin']);
    const employees = await listEmployees();
    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireSession(['admin']);
    const body = await request.json();
    const parsed = createEmployeeSchema.parse(body);
    const result = await createEmployee(parsed, actor);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
