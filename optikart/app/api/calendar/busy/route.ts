import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to   = searchParams.get("to");

    const events = await prisma.calendarEvent.findMany({
      where: {
        startTime: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to   ? { lte: new Date(to)   } : {}),
        },
      },
      select: { startTime: true },
    });

    // ── Timezone fix ──────────────────────────────────────────
    // Minden esemény T12:00:00.000Z-vel van mentve (déli 12 UTC).
    // A .toISOString() UTC-ban adja vissza → "2025-04-13T12:00:00.000Z"
    // → .slice(0, 10) → "2025-04-13" ✓ HELYES
    //
    // NE adjunk hozzá +12 órát – az régi kód volt T00:00:00Z-vel mentett
    // eseményekhez. Most hogy mindent T12:00:00Z-vel mentünk, a +12h
    // kétszeres eltolódást okoz: T12Z + 12h = T00Z másnap → HIBÁS.

    const busyDates = [...new Set(
      events
        .filter(e => e.startTime)
        .map(e => e.startTime!.toISOString().slice(0, 10))
    )];

    return NextResponse.json({ busyDates });
  } catch (err) {
    console.error("[GET /api/calendar/busy]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}