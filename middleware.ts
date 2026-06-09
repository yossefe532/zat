import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getExpectedSiteAccessToken, SITE_ACCESS_COOKIE } from '@/lib/site-access';

const PUBLIC_PATHS = ['/access'];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const expectedToken = await getExpectedSiteAccessToken();
  if (!expectedToken) {
    return NextResponse.next();
  }

  const currentToken = request.cookies.get(SITE_ACCESS_COOKIE)?.value;
  if (currentToken === expectedToken) {
    return NextResponse.next();
  }

  const accessUrl = new URL('/access', request.url);
  accessUrl.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(accessUrl);
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)'],
};
