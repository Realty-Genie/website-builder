import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const hostname = req.headers.get('host');
  const url = req.nextUrl;

  const isLocalhost = hostname?.includes("localhost") || hostname?.includes("127.0.0.1");
  const mainDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || (isLocalhost ? "localhost:3000" : "yourdomain.com");

  // If we are on a subdomain (e.g. mohak.localhost:3000)
  if (
    hostname &&
    hostname !== mainDomain &&
    !hostname.startsWith(`www.${mainDomain}`)
  ) {
    // Extract the subdomain string
    const subdomain = hostname.split('.')[0];

    // Rewrite the request to /landing/[subdomain]$path
    const searchParams = req.nextUrl.searchParams.toString();
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;
    
    return NextResponse.rewrite(new URL(`/landing/${subdomain}${path}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
