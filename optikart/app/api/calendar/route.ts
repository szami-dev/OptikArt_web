import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id as string);
    const isAdmin = (session.user as any).role === "ADMIN";

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from"); // ISO dátum
    const to   = searchParams.get("to");   // ISO dátum

    const dateFilter: any = {};
    if (from) dateFilter.gte = new Date(from);
    if (to)   dateFilter.lte = new Date(to);

    const events = await prisma.calendarEvent.findMany({
      where: {
        ...(Object.keys(dateFilter).length > 0
          ? { startTime: dateFilter }
          : {}),
        // User csak a saját projektjeihez tartozó eseményeket látja
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
        title: title || "Foglalás",
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        wholeDay: wholeDay ?? false,
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