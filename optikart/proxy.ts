import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role as string | undefined;

  // ── 1. API auth route-ok – soha ne blokkold ──────────────────
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // ── 2. Auth oldalak (login, register, stb.) ───────────────────
  const isAuthPage = pathname.startsWith("/auth");

  if (isAuthPage) {
    if (!isLoggedIn) {
      // Nem bejelentkezett → maradhat az auth oldalon
      return NextResponse.next();
    }
    // Bejelentkezett user auth oldalon → irányítsd a saját felületére
    return NextResponse.redirect(
      new URL(role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard", req.nextUrl)
    );
  }

  // ── 3. Nem bejelentkezett user védett oldalon ─────────────────
  if (!isLoggedIn) {
    const loginUrl = new URL("/auth/login", req.nextUrl);
    // Visszatérési URL megőrzése
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 4. Admin route-ok védelme ─────────────────────────────────
  // Sima user nem érhet el /admin/* oldalt semmilyen módon
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      // Visszairányítás a saját dashboardra 403 helyett
      return NextResponse.redirect(
        new URL("/user/dashboard", req.nextUrl)
      );
    }
  }

  // ── 5. User route-ok védelme (opcionális) ─────────────────────
  // Ha admin próbál /user/* oldalra menni, irányítsd az admin dashboardra
  // Ezt ki is kommentelhetod ha az adminnak szabad néznie a user felületet
  if (pathname.startsWith("/user")) {
    if (role === "ADMIN") {
      return NextResponse.redirect(
        new URL("/admin/dashboard", req.nextUrl)
      );
    }
  }

  // ── 6. Gyökér redirect ────────────────────────────────────────
  // Ha valaki a "/" -re megy bejelentkezve, irányítsd a megfelelő helyre
  if (pathname === "/dashboard" || pathname === "/profile") {
    return NextResponse.redirect(
      new URL(role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard", req.nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Auth oldalak – hogy a bejelentkezett usert át tudjuk irányítani
    "/auth/:path*",
    // Védett felületek
    "/admin/:path*",
    "/api/user/:path*",
    "/user/:path*",
    "/contact/:path*",
    // Általános redirect-ek
    "/dashboard",
    "/profile",
  ],
};