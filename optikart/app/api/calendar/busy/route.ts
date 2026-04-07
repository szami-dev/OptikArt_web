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

    // ── Timezone fix ─────────────────────────────────────────────
    // A DB-ben UTC-ben van tárolva. toISOString() UTC dátumot ad.
    // Ha pl. 2025-04-13T00:00:00+02:00 volt a szándék,
    // az UTC-ben 2025-04-12T22:00:00Z → toISOString slice → "2025-04-12" HIBÁS
    //
    // Megoldás: a dátumot a szerver LOCAL időzónájában konvertáljuk,
    // vagy – mivel a DB-ben egész napos eseményeknél T00:00:00 van mentve
    // helyi idő szerint – a toLocaleDateString-et használjuk hu-HU locale-lel.
    //
    // Legegyszerűbb megoldás: a nap meghatározásához ne UTC-t, hanem
    // a timestamp értékét adjuk vissza YYYY-MM-DD formátumban úgy, hogy
    // a +-2 órát hozzáadjuk (Budapest = UTC+1/+2).
    // De ez fragilis. A legtisztább: a frontend küldi a timezone offsetet,
    // vagy: mindkét oldalon T12:00:00-t használunk (déli 12 óra mindig
    // biztonságos, nem csúszik át előző/következő napra UTC±14 zónában sem).

    const busyDates = [...new Set(
      events
        .filter(e => e.startTime)
        .map(e => {
          const d = e.startTime!;
          // Budapest UTC+1/+2 – a legbiztonságosabb: ha a nap 00:00:00 UTC-ben
          // van mentve, adjunk hozzá 12 órát hogy biztosan ugyanazon a napon legyünk
          const adjusted = new Date(d.getTime() + 12 * 60 * 60 * 1000);
          return adjusted.toISOString().slice(0, 10);
        })
    )];

    return NextResponse.json({ busyDates });
  } catch (err) {
    console.error("[GET /api/calendar/busy]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}