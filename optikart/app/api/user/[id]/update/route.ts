import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return NextResponse.json({ error: "Érvénytelen ID" }, { status: 400 });

    const body = await req.json();
    const { name, email, phone, role, password, isVerified } = body;

    // Email egyediség ellenőrzés (saját maga kivételével)
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Ez az email már foglalt" }, { status: 409 });
      }
    }

    const updateData: Record<string, any> = {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(role !== undefined && { role }),
      ...(isVerified !== undefined && { isVerified }),
    };

    // Jelszó csak ha küldtek újat
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, phone: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[PATCH /api/user/[id]/update]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}