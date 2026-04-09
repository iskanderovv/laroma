import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import {routing} from './i18n/routing';
import { ADMIN_COOKIE_NAME } from './lib/admin/auth';
 
const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const hasAdminToken = Boolean(request.cookies.get(ADMIN_COOKIE_NAME)?.value);

    if (pathname === '/admin/login' && hasAdminToken) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    if (pathname !== '/admin/login' && !hasAdminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  return intlMiddleware(request);
}
 
export const config = {
  matcher: ['/', '/(uz|ru)/:path*', '/admin/:path*']
};
