import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/http';
import { getCourseCatalog } from '@/lib/portal';

export async function GET() {
  try {
    const courses = await getCourseCatalog();
    return NextResponse.json({ success: true, data: courses });
  } catch (error) {
    return errorResponse(error);
  }
}
