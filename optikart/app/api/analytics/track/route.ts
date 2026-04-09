import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

function parseUserAgent(ua: string) {
  const device =
    /mobile|android|iphone|ipad|ipod/i.test(ua)
      ? /ipad/i.test(ua) ? "tablet" : "mobile"
      : "desktop";

  const browser =
    /edg\//i.test(ua)   ? "edge"    :
    /chrome/i.test(ua)  ? "chrome"  :
    /firefox/i.test(ua) ? "firefox" :
    /safari/i.test(ua)  ? "safari"  : "other";

  const os =
    /windows/i.test(ua)     ? "windows" :
    /macintosh/i.test(ua)   ? "macos"   :
    /iphone|ipad/i.test(ua) ? "ios"     :
    /android/i.test(ua)     ? "android" :
    /linux/i.test(ua)       ? "linux"   : "other";

  return { device, browser, os };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sessionId,
      type,
      page,
      meta,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    if (!sessionId || !type) {
      return NextResponse.json({ error: "sessionId és type kötelező" }, { status: 400 });
    }

    // Bejelentkezett user azonosítása
    let userId: number | null = null;
    try {
      const authSession = await auth();
      if (authSession?.user?.id) userId = parseInt(authSession.user.id as string);
    } catch { /* nem baj ha nincs session */ }

    const ua = req.headers.get("user-agent") ?? "";
    const { device, browser, os } = parseUserAgent(ua);

    // Session upsert
    const session = await prisma.analyticsSession.upsert({
      where:  { id: sessionId },
      update: { lastSeenAt: new Date() },
      create: {
        id:          sessionId,
        lastSeenAt:  new Date(),
        userAgent:   ua,
        device,
        browser,
        os,
        referrer:    referrer    ?? null,
        utmSource:   utmSource   ?? null,
        utmMedium:   utmMedium   ?? null,
        utmCampaign: utmCampaign ?? null,
        userId,
      },
    });

    // Session duration frissítése session_end esetén
    if (type === "session_end" && meta?.duration) {
      await prisma.analyticsSession.update({
        where: { id: sessionId },
        data:  { duration: meta.duration as number },
      });
    }

    // Esemény rögzítése
    await prisma.analyticsEvent.create({
      data: {
        sessionId: session.id,
        type,
        page:  page ?? null,
        meta:  meta ?? undefined,
      },
    });

    return NextResponse.json({ ok: true, sessionId: session.id });
  } catch (err) {
    console.error("[POST /api/analytics/track]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}