/**
 * Next.js "proxy" middleware (Next 16 convention; the old name was
 * "middleware.ts", now deprecated).
 *
 * IMPORTANT: this app stores the auth token in localStorage, which is only
 * readable in the browser. This runs on the server/edge and CANNOT read
 * localStorage, so it cannot verify the token here. If it redirected based on a
 * (non-existent) cookie it would bounce every logged-in user to /login and break
 * the app. Real route protection is therefore enforced client-side by
 * AuthGuard / RouteGuard (which read localStorage after mount).
 *
 * This is an explicit, intentional pass-through and the single place to add
 * edge-level checks later if the token is ever moved to an httpOnly cookie.
 */
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/register", "/forgot-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Cannot read localStorage here, pass through; AuthGuard handles protection.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
