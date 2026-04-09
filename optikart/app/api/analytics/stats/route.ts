import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("range") ?? "30");
    const from = new Date(Date.now() - days * 86400000);

    const [sessions, events, totalSessions, totalEvents] = await Promise.all([
      prisma.analyticsSession.findMany({
        where: { createdAt: { gte: from } },
        select: {
          id: true, createdAt: true, lastSeenAt: true,
          device: true, browser: true, os: true,
          referrer: true, utmSource: true, utmCampaign: true,
          duration: true, userId: true,
        },
      }),
      prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: from } },
        select: {
          id: true, createdAt: true, type: true,
          page: true, meta: true, sessionId: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.analyticsSession.count(),
      prisma.analyticsEvent.count(),
    ]);

    // Pageview-ek oldalanként
    const pageviews = events.filter(e => e.type === "pageview");
    const pageMap: Record<string, number> = {};
    pageviews.forEach(e => { if (e.page) pageMap[e.page] = (pageMap[e.page] ?? 0) + 1; });
    const topPages = Object.entries(pageMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    // Device bontás
    const deviceMap: Record<string, number> = {};
    sessions.forEach(s => { if (s.device) deviceMap[s.device] = (deviceMap[s.device] ?? 0) + 1; });

    // Browser bontás
    const browserMap: Record<string, number> = {};
    sessions.forEach(s => { if (s.browser) browserMap[s.browser] = (browserMap[s.browser] ?? 0) + 1; });

    // Referrer bontás
    const refMap: Record<string, number> = {};
    sessions.forEach(s => {
      let ref = "Közvetlen";
      try { if (s.referrer) ref = new URL(s.referrer).hostname.replace("www.", ""); } catch {}
      refMap[ref] = (refMap[ref] ?? 0) + 1;
    });
    const topReferrers = Object.entries(refMap)
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([referrer, count]) => ({ referrer, count }));

    // Napi forgalom
    const dailyMap: Record<string, { sessions: number; pageviews: number }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - i * 86400000);
      dailyMap[d.toISOString().slice(0, 10)] = { sessions: 0, pageviews: 0 };
    }
    sessions.forEach(s => {
      const key = s.createdAt.toISOString().slice(0, 10);
      if (dailyMap[key]) dailyMap[key].sessions++;
    });
    pageviews.forEach(e => {
      const key = e.createdAt.toISOString().slice(0, 10);
      if (dailyMap[key]) dailyMap[key].pageviews++;
    });
    const dailyData = Object.entries(dailyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({ date, ...data }));

    // Wizard analitika
    const wizardSteps: Record<number, number> = {};
    let wizardComplete = 0;
    events.filter(e => e.type.startsWith("wizard_")).forEach(e => {
      if (e.type === "wizard_step") {
        const step = (e.meta as any)?.step ?? 0;
        wizardSteps[step] = (wizardSteps[step] ?? 0) + 1;
      }
      if (e.type === "wizard_complete") wizardComplete++;
    });

    // Esemény típus bontás
    const eventTypeMap: Record<string, number> = {};
    events.forEach(e => { eventTypeMap[e.type] = (eventTypeMap[e.type] ?? 0) + 1; });

    // Visszatérő látogatók
    const userSessionCount: Record<number, number> = {};
    sessions.filter(s => s.userId).forEach(s => {
      userSessionCount[s.userId!] = (userSessionCount[s.userId!] ?? 0) + 1;
    });
    const returningUsers = Object.values(userSessionCount).filter(c => c > 1).length;

    const durationSessions = sessions.filter(s => s.duration);
    const avgDuration = durationSessions.length
      ? durationSessions.reduce((s, x) => s + (x.duration ?? 0), 0) / durationSessions.length
      : 0;

    return NextResponse.json({
      range: days,
      from:  from.toISOString(),
      summary: {
        totalSessions,
        totalEvents,
        periodSessions:     sessions.length,
        periodPageviews:    pageviews.length,
        periodEvents:       events.length,
        uniqueUsers:        new Set(sessions.filter(s => s.userId).map(s => s.userId)).size,
        returningUsers,
        avgDuration:        Math.round(avgDuration),
        avgPagesPerSession: sessions.length > 0
          ? Math.round((pageviews.length / sessions.length) * 10) / 10 : 0,
        projectCreated: events.filter(e => e.type === "project_created").length,
        wizardComplete,
      },
      topPages,
      topReferrers,
      dailyData,
      deviceMap,
      browserMap,
      wizardSteps,
      eventTypeMap,
      recentEvents: events.slice(0, 50).map(e => ({
        id:        e.id,
        createdAt: e.createdAt,
        type:      e.type,
        page:      e.page,
        meta:      e.meta,
      })),
    });
  } catch (err) {
    console.error("[GET /api/analytics/stats]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}