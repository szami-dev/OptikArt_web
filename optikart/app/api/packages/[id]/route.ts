import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

async function isAdmin() {
  const session = await auth();
  return (session?.user as any)?.role === "ADMIN";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkg = await prisma.package.findUnique({
      where: { id: parseInt(id) },
      include: { category: true, bulletPoints: true },
    });
    if (!pkg) return NextResponse.json({ error: "Nem található" }, { status: 404 });
    return NextResponse.json({ package: pkg });
  } catch (err) {
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    const pkgId = parseInt(id);
    const body = await req.json();
    const { name, description, price, categoryId, subtype, bulletPoints } = body;

    if (bulletPoints !== undefined) {
      await prisma.bulletPoint.deleteMany({ where: { packageId: pkgId } });
    }

    const pkg = await prisma.package.update({
      where: { id: pkgId },
      data: {
        ...(name        !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price       !== undefined && { price: price ? parseFloat(String(price)) : null }),
        ...(subtype     !== undefined && { subtype }),
        // categoryId → nested connect
        ...(categoryId !== undefined && categoryId !== null && {
          category: { connect: { id: parseInt(String(categoryId)) } },
        }),
        ...(bulletPoints !== undefined && {
          bulletPoints: { create: bulletPoints.map((t: string) => ({ title: t })) },
        }),
      },
      include: { category: true, bulletPoints: true },
    });

    return NextResponse.json({ package: pkg });
  } catch (err: any) {
    if (err?.code === "P2025") return NextResponse.json({ error: "Nem található" }, { status: 404 });
    console.error("[PATCH /api/packages/[id]]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { id } = await params;
    const pkgId = parseInt(id);

    await prisma.bulletPoint.deleteMany({ where: { packageId: pkgId } });
    await prisma.package.delete({ where: { id: pkgId } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === "P2025") return NextResponse.json({ error: "Nem található" }, { status: 404 });
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}