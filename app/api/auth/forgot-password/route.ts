// app/api/auth/forgot-password/route.ts

import { NextResponse }           from "next/server";
import { randomBytes }            from "crypto";
import prisma                     from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const TOKEN_TTL_MS = 1000 * 60 * 60; // 1 óra

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email kötelező." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where:  { email: normalized },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      // Előző tokenek érvénytelenítése
      await prisma.passwordResetToken.updateMany({
        where: { email: normalized, used: false },
        data:  { used: true },
      });

      // Új token
      const token = randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          token,
          email:     normalized,
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

      // mail.ts-ből hívjuk – ugyanolyan stílus mint a többi email
      await sendPasswordResetEmail(
        normalized,
        user.name ?? "Felhasználó",
        resetUrl,
      );
    }

    // Mindig ugyanaz a válasz (security)
    return NextResponse.json({
      message: "Ha ez az email cím regisztrálva van, hamarosan kapsz egy levelet.",
    });

  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json(
      { error: "Szerverhiba. Próbáld újra később." },
      { status: 500 },
    );
  }
}