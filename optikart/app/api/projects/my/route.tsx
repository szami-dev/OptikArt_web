import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id as string);

    const projects = await prisma.project.findMany({
      where: {
        users: { some: { id: userId } },
      },
      include: {
        type: true,
        category: true,
        _count: {
          select: { messages: true, galleries: true, calendarEvents: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: { id: true, name: true, role: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (err) {
    console.error("[GET /api/projects/my]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}