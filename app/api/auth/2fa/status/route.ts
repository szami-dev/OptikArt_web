// app/api/auth/2fa/status/route.ts
// DB-ből olvassa a 2FA státuszt – nem a session-ből
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth }         from "@/auth";
import prisma           from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    const user   = await prisma.user.findUnique({
      where:  { id: userId },
      select: { twoFactorEnabled: true },
    });

    return NextResponse.json({ twoFactorEnabled: user?.twoFactorEnabled ?? false });
  } catch (err) {
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}