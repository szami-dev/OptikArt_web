import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ exists: false, isVerified: false });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isVerified: true },
  });

  return NextResponse.json({
    exists: !!user,
    isVerified: user?.isVerified ?? false,
  });
}