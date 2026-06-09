import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { updateEmployeeStatus } from '@/lib/portal';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireSession(['admin']);
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { isActive?: boolean };

    if (typeof body.isActive !== 'boolean') {
      throw new Error('حقل حالة الموظف مطلوب');
    }

    const employee = await updateEmployeeStatus(id, body.isActive, actor);
    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    return errorResponse(error);
  }
}
