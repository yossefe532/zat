import { NextResponse } from 'next/server';
import { SITE_ACCESS_COOKIE } from '@/lib/site-access';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SITE_ACCESS_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}
