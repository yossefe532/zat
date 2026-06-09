import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = (await request.json().catch(() => ({}))) as { password?: string };

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  if (!password || password !== expected) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('zat_admin', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return response;
}

