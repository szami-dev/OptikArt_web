import { auth } from "@/auth";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nem vagy bejelentkezve" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Minden mező kitöltése kötelező" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Az új jelszó legalább 8 karakter legyen" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { password: true },
  });

  if (!user?.password) {
    return NextResponse.json({ error: "Nincs jelszó beállítva ennél a fióknál" }, { status: 400 });
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    return NextResponse.json({ error: "A jelenlegi jelszó helytelen" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: Number(session.user.id) },
    data: { password: hashed },
  });

  return NextResponse.json({ success: true });
}