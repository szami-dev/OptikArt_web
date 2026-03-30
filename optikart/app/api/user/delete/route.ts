import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nem vagy bejelentkezve" }, { status: 401 });
  }

  const userId = Number(session.user.id);

  // Kapcsolódó adatok törlése a megfelelő sorrendben
  // (a Prisma nem töröl cascade-del automatikusan ha nincs onDelete: Cascade)
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.account.deleteMany({ where: { userId } });
  await prisma.verificationToken.deleteMany({
    where: {
      email: session.user.email!,
    },
  });

  // Végül maga a user
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}