import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { createStudentRecord, listStudents } from '@/lib/portal';
import { createStudentSchema } from '@/lib/schemas';

export async function GET() {
  try {
    const actor = await requireSession(['admin', 'employee']);
    const students = await listStudents(actor);
    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireSession(['employee']);
    const body = await request.json();
    const parsed = createStudentSchema.parse(body);
    const student = await createStudentRecord(parsed, actor);
    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
