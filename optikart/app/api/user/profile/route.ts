import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nem vagy bejelentkezve" }, { status: 401 });
  }

  const { name, phone } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "A név nem lehet üres" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: Number(session.user.id) },
    data: {
      name: name.trim(),
      phone: phone?.trim() || null,
    },
    select: { id: true, name: true, phone: true, email: true },
  });

  return NextResponse.json({ user: updated });
}