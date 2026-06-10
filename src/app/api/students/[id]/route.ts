import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { deleteStudentRecord, updateStudentCodeValidity, updateStudentRecord } from '@/lib/portal';
import { updateCodeValiditySchema, updateStudentSchema } from '@/lib/schemas';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireSession(['admin', 'employee']);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateCodeValiditySchema.parse(body);
    const student = await updateStudentCodeValidity(id, parsed.codeValidityDays, actor);
    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireSession(['admin']);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateStudentSchema.parse(body);
    const student = await updateStudentRecord(id, parsed, actor);
    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireSession(['admin']);
    const { id } = await context.params;
    await deleteStudentRecord(id, actor);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
