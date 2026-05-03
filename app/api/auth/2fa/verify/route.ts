// app/api/auth/2fa/verify/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth }         from "@/auth";
import prisma           from "@/lib/db";
import { verifySync }   from "otplib";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Kód szükséges" }, { status: 400 });

    const userId = parseInt((session.user as any).id);
    const user   = await prisma.user.findUnique({ where: { id: userId } });

    if (!user?.twoFactorSecret || !user.twoFactorEnabled) {
      return NextResponse.json({ error: "2FA nincs beállítva" }, { status: 400 });
    }

    const result = verifySync({
      token:    code.replace(/\s/g, ""),
      secret:   user.twoFactorSecret,
      strategy: "totp",
    });

    if (!result.valid) {
      return NextResponse.json({ error: "Érvénytelen kód" }, { status: 400 });
    }

    // Cookie: jelzi a middleware-nek hogy a verify kész
    const response = NextResponse.json({ ok: true });
    response.cookies.set("2fa_setup_done", "1", {
      httpOnly: false,
      maxAge:   60,
      path:     "/",
      sameSite: "lax",
    });
    return response;
  } catch (err) {
    console.error("[POST /api/auth/2fa/verify]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}