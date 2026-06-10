import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { deleteEmployee, updateEmployee, updateEmployeeStatus } from '@/lib/portal';
import { updateEmployeeSchema } from '@/lib/schemas';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireSession(['admin']);
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    if (Object.keys(body).length === 1 && typeof body.isActive === 'boolean') {
      const employee = await updateEmployeeStatus(id, body.isActive, actor);
      return NextResponse.json({ success: true, data: employee });
    }

    const parsed = updateEmployeeSchema.parse(body);
    const employee = await updateEmployee(id, parsed, actor);
    return NextResponse.json({ success: true, data: employee });
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
    await deleteEmployee(id, actor);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
