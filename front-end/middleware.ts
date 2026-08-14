import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/constants/routes";

const PROTECTED_PREFIX = ROUTES.DASHBOARD;
const PROTECTED_ADMIN_PREFIX = ROUTES.ADMIN;

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const refreshToken = request.cookies.get("refresh_token")?.value;
  const hasSession = Boolean(refreshToken?.trim());

  if (pathname.startsWith(PROTECTED_ADMIN_PREFIX)) {
    if (!hasSession) {
      const loginUrl = new URL(ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith(PROTECTED_PREFIX)) {
    if (!hasSession) {
      const loginUrl = new URL(ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (hasSession) {
    if (searchParams.has("reauth")) {
      const res = NextResponse.next();
      res.cookies.delete("refresh_token");
      return res;
    }

    const isVerifyPath =
      pathname === ROUTES.VERIFY || pathname.startsWith(`${ROUTES.VERIFY}/`);
    const isBannedPath =
      pathname === ROUTES.BANNED || pathname.startsWith(`${ROUTES.BANNED}/`);
    const hasOptIn =
      searchParams.has("token") ||
      searchParams.has("type") ||
      isVerifyPath ||
      isBannedPath;

    if (!hasOptIn) {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify",
    "/banned",
  ],
};
