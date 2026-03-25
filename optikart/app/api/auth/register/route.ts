import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  const { name, email, phone, password } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Hiányzó kötelező adatok" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ez az email már foglalt" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      password: hashedPassword,
    },
  });

  return NextResponse.json({ message: "Sikeres regisztráció", userId: user.id });
}