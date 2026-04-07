import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, role, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email és jelszó kötelező" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Ez az email már foglalt" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const emailResult = await sendWelcomeEmail(email, name);
    if (!emailResult) {
      return NextResponse.json({ error: "Hiba történt a köszöntő email küldésekor" }, { status: 500 });
    }
    else {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashed,
        role: role ?? "USER",
        isVerified: true, // Admin által létrehozott user rögtön verifikált
      },
      select: { id: true, name: true, email: true, role: true, phone: true },
    });

    return NextResponse.json({ user }, { status: 201 });}
  } catch (err) {
    console.error("[POST /api/user/create]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
    
  }
}