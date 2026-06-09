import { NextResponse } from 'next/server';
import { createSiteAccessToken, SITE_ACCESS_COOKIE } from '@/lib/site-access';

export async function POST(request: Request) {
  const { password } = (await request.json().catch(() => ({}))) as { password?: string };
  const expectedPassword = process.env.SITE_ACCESS_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.json(
      { success: false, message: 'لم يتم ضبط كلمة مرور عامة للموقع بعد' },
      { status: 500 },
    );
  }

  if (!password || password !== expectedPassword) {
    return NextResponse.json(
      { success: false, message: 'كلمة المرور غير صحيحة' },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SITE_ACCESS_COOKIE, await createSiteAccessToken(expectedPassword), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  return response;
}
