import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('pos_session');

  // JIKA mencoba akses halaman admin (/dashboard atau /dashboard/products) tapi BELUM login
  // MAKA paksa kembali ke halaman pembeli (root '/')
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Jika sudah login tapi iseng buka halaman login lagi, arahkan ke dashboard
  if (request.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};