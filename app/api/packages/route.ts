import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      include: { category: true, bulletPoints: true },
      orderBy: [{ price: "asc" }],
    });
    return NextResponse.json({ packages });
  } catch (err) {
    console.error("[GET /api/packages]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, price, categoryId, subtype, bulletPoints } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "A csomag neve kötelező" }, { status: 400 });
    }

    // Prisma 7.x custom output: relációt nested connect-tel kell megadni
    const pkg = await prisma.package.create({
      data: {
        name,
        description: description ?? null,
        price: price ? parseFloat(String(price)) : null,
        subtype: subtype ?? null,
        ...(categoryId
          ? { category: { connect: { id: parseInt(String(categoryId)) } } }
          : {}),
        ...(bulletPoints?.length
          ? { bulletPoints: { create: bulletPoints.map((t: string) => ({ title: t })) } }
          : {}),
      },
      include: { category: true, bulletPoints: true },
    });

    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/packages]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}