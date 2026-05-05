// app/api/auth/2fa/enable/route.ts
// Sikeres enable után cookie-t állít be hogy a middleware
// tudja hogy a session még nem frissült de a setup kész
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

    if (!user?.twoFactorSecret) {
      return NextResponse.json({ error: "Nincs generált secret" }, { status: 400 });
    }

    const result = verifySync({
  token:    code.replace(/\s/g, ""),
  secret:   user.twoFactorSecret,
  strategy: "totp",
  window:   1,
} as any);

    if (!result.valid) {
      return NextResponse.json({ error: "Érvénytelen kód" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data:  { twoFactorEnabled: true },
    });

    // Cookie: jelzi a middleware-nek hogy a setup kész
    // rövid életű – csak addig kell amíg a session frissül
    const response = NextResponse.json({ ok: true });
    response.cookies.set("2fa_setup_done", "1", {
      httpOnly: false, // kliensnek is olvasható ha kell
      maxAge:   60,    // 60 másodpercig él – bőven elég
      path:     "/",
      sameSite: "lax",
    });
    return response;
  } catch (err) {
    console.error("[POST /api/auth/2fa/enable]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}