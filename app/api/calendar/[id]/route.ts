import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

// ── Timezone-biztos dátum parse ───────────────────────────────
// "YYYY-MM-DD" → T12:00:00Z (déli 12 UTC, minden időzónában ugyanaz a nap)
// "YYYY-MM-DDTHH:mm..." → normál parse
function safeParse(iso: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso)
    ? new Date(`${iso}T12:00:00.000Z`)
    : new Date(iso);
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id as string);
    const isAdmin = (session.user as any).role === "ADMIN";

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to   = searchParams.get("to");

    const events = await prisma.calendarEvent.findMany({
      where: {
        ...(from || to ? {
          startTime: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to   ? { lte: new Date(to)   } : {}),
          },
        } : {}),
        ...(!isAdmin
          ? { project: { users: { some: { id: userId } } } }
          : {}),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            users: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ events });
  } catch (err) {
    console.error("[GET /api/calendar]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, startTime, endTime, wholeDay, projectId } = body;

    if (!startTime) {
      return NextResponse.json({ error: "Kezdő időpont kötelező" }, { status: 400 });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title:     title || "Foglalás",
        startTime: safeParse(startTime),
        endTime:   endTime ? safeParse(endTime) : null,
        wholeDay:  wholeDay ?? false,
        projectId: projectId ?? null,
      },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/calendar]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}