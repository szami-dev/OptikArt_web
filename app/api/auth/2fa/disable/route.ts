// app/api/auth/2fa/disable/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth }         from "@/auth";
import prisma           from "@/lib/db";
import { verifySync }   from "otplib"; // ← verifySync

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role === "ADMIN") {
      return NextResponse.json({ error: "Admin nem kapcsolhatja ki a 2FA-t" }, { status: 403 });
    }

    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Kód szükséges" }, { status: 400 });

    const userId = parseInt((session.user as any).id);
    const user   = await prisma.user.findUnique({ where: { id: userId } });

    if (!user?.twoFactorSecret) {
      return NextResponse.json({ error: "2FA nincs beállítva" }, { status: 400 });
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
      data:  { twoFactorEnabled: false, twoFactorSecret: null },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/auth/2fa/disable]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}