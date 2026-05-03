// app/api/auth/2fa/setup/route.ts
export const runtime = "nodejs";

import { NextResponse }                from "next/server";
import { auth }                        from "@/auth";
import prisma                          from "@/lib/db";
import { generateSecret, generateURI } from "otplib";
import QRCode                          from "qrcode";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    const user   = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "Nem található" }, { status: 404 });

    const secret    = generateSecret();
    const otpauth   = await generateURI({
      secret,
      label:    user.email,
      issuer:   "OptikArt",
      strategy: "totp",
    });
    const qrDataUrl = await QRCode.toDataURL(otpauth);

    await prisma.user.update({
      where: { id: userId },
      data:  { twoFactorSecret: secret },
    });

    return NextResponse.json({ qrDataUrl, secret });
  } catch (err) {
    console.error("[POST /api/auth/2fa/setup]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}