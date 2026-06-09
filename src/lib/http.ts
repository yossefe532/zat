import { NextResponse } from 'next/server';

export function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';

  if (message === 'UNAUTHORIZED') {
    return NextResponse.json({ success: false, message: 'غير مصرح لك بالدخول' }, { status: 401 });
  }

  if (message === 'FORBIDDEN') {
    return NextResponse.json({ success: false, message: 'لا تملك الصلاحية المطلوبة' }, { status: 403 });
  }

  if (message === 'NOT_FOUND') {
    return NextResponse.json({ success: false, message: 'العنصر المطلوب غير موجود' }, { status: 404 });
  }

  return NextResponse.json({ success: false, message }, { status: 400 });
}
