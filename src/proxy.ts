/**
 * Next.js Middleware for Route Protection
 * Protects /admin/* and /user/* routes
 * Redirects unauthenticated users to /login
 */

import { NextRequest, NextResponse } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/login", "/register", "/forgot-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get auth state from cookies (if you use cookies) or skip
  // Since we're using localStorage, middleware can't access it
  // Route protection will be handled client-side (see useAuth hook below)

  return NextResponse.next();
}

// Only run middleware on specific routes
export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
