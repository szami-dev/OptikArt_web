import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return new NextResponse("Hiányzó token", { status: 400 });

  // 1. Megkeressük a tokent
  const existingToken = await prisma.verificationToken.findUnique({
    where: { token }
  });

  if (!existingToken || new Date() > existingToken.expires) {
    return new NextResponse("Lejárt vagy érvénytelen token", { status: 400 });
  }

  // 2. Frissítjük a felhasználót
  await prisma.user.update({
    where: { email: existingToken.email },
    data: { 
      isVerified: true,
      emailVerifiedAt: new Date(),
    }
  });

  // 3. Töröljük a használt tokent
  await prisma.verificationToken.delete({
    where: { id: existingToken.id }
  });

  return NextResponse.json({ message: "Sikeres" });
}