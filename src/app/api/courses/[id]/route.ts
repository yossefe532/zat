import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { deleteCourse, updateCourse } from '@/lib/portal';
import { courseSchema } from '@/lib/schemas';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireSession(['admin']);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = courseSchema.parse(body);
    const course = await updateCourse(Number(id), parsed, actor);
    return NextResponse.json({ success: true, data: course });
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
    await deleteCourse(Number(id), actor);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
