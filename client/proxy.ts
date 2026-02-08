import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  // Proxy doesn't have access to localStorage, so we can't check auth here
  // Auth checking is handled client-side in the app layout
  // This proxy only handles redirects if absolutely necessary
  
  // Just let everything through - client-side auth will handle redirects
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
