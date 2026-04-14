// app/api/auth/reset-password/route.ts

import { NextResponse }              from "next/server";
import bcrypt                        from "bcryptjs";
import prisma                        from "@/lib/db";
import { sendPasswordChangedEmail }  from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Hiányzó adatok." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A jelszónak legalább 8 karakter hosszúnak kell lennie." },
        { status: 400 },
      );
    }

    // Token keresése
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.used) {
      return NextResponse.json(
        { error: "Érvénytelen vagy már felhasznált link. Kérj új jelszó-visszaállítót." },
        { status: 400 },
      );
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { error: "A link lejárt (1 óra). Kérj új jelszó-visszaállítót." },
        { status: 400 },
      );
    }

    // Felhasználó keresése
    const user = await prisma.user.findUnique({
      where:  { email: resetToken.email },
      select: { id: true, name: true, email: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "A fiók nem található." }, { status: 400 });
    }

    // ── ÚJ: ne engedjen ugyanolyan jelszót ───────────────────
    if (user.password) {
      const isSame = await bcrypt.compare(password, user.password);
      if (isSame) {
        return NextResponse.json(
          { error: "Az új jelszó nem egyezhet meg a régivel." },
          { status: 400 },
        );
      }
    }

    // Új jelszó hash + token invalidálás – tranzakcióban
    const hashed = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data:  { password: hashed },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data:  { used: true },
      }),
    ]);

    // Megerősítő email küldése
    await sendPasswordChangedEmail(
      user.email,
      user.name ?? "Felhasználó",
    );

    return NextResponse.json({ message: "Jelszó sikeresen megváltoztatva." });

  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json(
      { error: "Szerverhiba. Próbáld újra később." },
      { status: 500 },
    );
  }
}