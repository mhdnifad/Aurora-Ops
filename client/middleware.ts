import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware doesn't have access to localStorage, so we can't check auth here
  // Auth checking is handled client-side in the app layout
  // This middleware only handles redirects if absolutely necessary
  
  const { pathname } = request.nextUrl;

  // Just let everything through - client-side auth will handle redirects
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
