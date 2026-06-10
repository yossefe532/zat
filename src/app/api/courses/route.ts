import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth';
import { errorResponse } from '@/lib/http';
import { createCourse, getCourseCatalog } from '@/lib/portal';
import { courseSchema } from '@/lib/schemas';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = ['1', 'true'].includes(searchParams.get('includeInactive') ?? '');

    if (includeInactive) {
      await requireSession(['admin']);
    }

    const courses = await getCourseCatalog({ includeInactive });
    return NextResponse.json({ success: true, data: courses });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireSession(['admin']);
    const body = await request.json();
    const parsed = courseSchema.parse(body);
    const course = await createCourse(parsed, actor);
    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    return errorResponse(error);
  }
}
