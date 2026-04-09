import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const typeId = searchParams.get("typeId");
    const search = searchParams.get("search");

    const where: any = {};
    if (status) where.status = status;
    if (typeId) where.typeId = parseInt(typeId);
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { users: { some: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        users: { select: { id: true, name: true, email: true } },
        type: true,
        category: true,
        _count: { select: { messages: true, galleries: true, calendarEvents: true } },
        // Az admin projekt listán a DateBadge-hez kell
        calendarEvents: {
          select: { id: true, startTime: true },
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (err) {
    console.error("[GET /api/projects]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}