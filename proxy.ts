// middleware.ts
// A 2FA állapotot cookie-val kezeljük a session race condition elkerülésére

import NextAuth        from "next-auth";
import { authConfig }  from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req: any) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn        = !!req.auth;
  const role              = (req.auth?.user as any)?.role as string | undefined;
  const twoFactorEnabled  = (req.auth?.user as any)?.twoFactorEnabled as boolean | undefined;
  const twoFactorVerified = (req.auth?.user as any)?.twoFactorVerified as boolean | undefined;

  // ── 1. API auth route-ok ──────────────────────────────────────
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // ── 2. 2FA oldalak – middleware nem szól bele ────────────────
  if (pathname.startsWith("/auth/2fa-setup") || pathname.startsWith("/auth/2fa-verify")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
    return NextResponse.next();
  }

  // ── 3. Auth oldalak ───────────────────────────────────────────
  if (pathname.startsWith("/auth")) {
    if (!isLoggedIn) return NextResponse.next();
    return NextResponse.redirect(
      new URL(role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard", req.nextUrl)
    );
  }

  // ── 4. Nem bejelentkezett ─────────────────────────────────────
  if (!isLoggedIn) {
    const loginUrl = new URL("/auth/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 5. 2FA ellenőrzés – csak ha SESSION már frissült ─────────
  // A "2fa_setup_done" cookie jelzi hogy a setup épp befejeződött
  // és a session még nem frissült – ilyenkor átengedjük
  const setupDoneCookie = req.cookies.get("2fa_setup_done")?.value;

  if (role === "ADMIN" && !twoFactorEnabled && !setupDoneCookie) {
    return NextResponse.redirect(new URL("/auth/2fa-setup", req.nextUrl));
  }

  if (twoFactorEnabled && !twoFactorVerified && !setupDoneCookie) {
    const target = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/auth/2fa-verify?redirect=${target}`, req.nextUrl)
    );
  }

  // ── 6. Admin/User route védelem ───────────────────────────────
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/user/dashboard", req.nextUrl));
  }
  if (pathname.startsWith("/user") && role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.nextUrl));
  }

  // ── 7. Gyökér redirect ────────────────────────────────────────
  if (pathname === "/dashboard" || pathname === "/profile") {
    return NextResponse.redirect(
      new URL(role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard", req.nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/auth/:path*",
    "/admin/:path*",
    "/api/user/:path*",
    "/user/:path*",
    "/contact/:path*",
    "/dashboard",
    "/profile",
  ],
};