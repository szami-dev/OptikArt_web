import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

// User-oldali projekt lekérés – csak a saját projektjét láthatja
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id as string);
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return NextResponse.json({ error: "Érvénytelen ID" }, { status: 400 });

    const project = await prisma.project.findFirst({
      where: {
        id,
        users: { some: { id: userId } }, // csak a sajátját
      },
      include: {
        type: true,
        category: { include: { bulletPoints: true } },
        calendarEvents: { orderBy: { startTime: "asc" } },
        galleries: {
          include: {
            images: true,
          },
        },
        messages: {
          include: {
            sender: { select: { id: true, name: true, role: true } },
            receiver: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Nem található" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (err) {
    console.error("[GET /api/projects/[id]/user]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}