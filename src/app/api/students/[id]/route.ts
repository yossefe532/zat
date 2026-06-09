import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { updateStudentCodeValidity } from '@/lib/portal';
import { updateCodeValiditySchema } from '@/lib/schemas';

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
