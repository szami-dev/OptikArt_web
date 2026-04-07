import prisma from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Hiányzó email" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ success: true }); // biztonsági okból ne áruljuk el
    if (user.isVerified) return NextResponse.json({ error: "Már meg van erősítve" }, { status: 400 });

    await sendVerificationEmail(email, user.name ?? "");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Váratlan hiba" }, { status: 500 });
  }
}