// app/api/chat/guest/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

import { sendGuestChatConfirmationEmail, sendGuestChatAdminNotificationEmail } from "@/lib/email";


// ── GET ───────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token   = searchParams.get("token");
    const listAll = searchParams.get("list") === "true";

    // Admin: összes guest session
    if (listAll) {
      const authSession = await auth();
      if (!authSession?.user?.id || (authSession.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const sessions = await prisma.guestChatSession.findMany({
        include: {
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
          _count:   { select: { messages: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
      // Hány guest sessionre nincs még admin válasz
      const unanswered = sessions.filter(s =>
        s.messages.length > 0 && !s.messages[0].isAdminReply
      ).length;
      return NextResponse.json({ sessions, unanswered });
    }

    // Guest: saját üzenetei token alapján
    if (!token) {
      return NextResponse.json({ error: "Token szükséges" }, { status: 400 });
    }
    const session = await prisma.guestChatSession.findUnique({
      where:   { id: token },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!session) {
      return NextResponse.json({ error: "Session nem található" }, { status: 404 });
    }
    // Admin válaszokat olvasottnak jelöljük
    await prisma.guestChatMessage.updateMany({
      where: { sessionId: token, isAdminReply: true, isRead: false },
      data:  { isRead: true },
    });
    return NextResponse.json({
      session:  { id: session.id, name: session.name, email: session.email },
      messages: session.messages,
    });
  } catch (err) {
    console.error("[GET /api/chat/guest]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

// ── POST: guest üzenet (session létrehozás vagy folytatás) ────
export async function POST(req: Request) {
  try {
    const { name, email, body, token } = await req.json();
 
    if (!email?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "Email és üzenet kötelező" }, { status: 400 });
    }
 
    // ── Session keresés vagy létrehozás ──────────────────────
    let guestSession;
    if (token) {
      guestSession = await prisma.guestChatSession.findUnique({ where: { id: token } });
    }
    if (!guestSession) {
      if (!name?.trim()) {
        return NextResponse.json({ error: "Név kötelező az első üzenethez" }, { status: 400 });
      }
      guestSession = await prisma.guestChatSession.create({
        data: { name: name.trim(), email: email.trim() },
      });
    }
 
    await prisma.guestChatMessage.create({
      data: { sessionId: guestSession.id, body: body.trim(), isAdminReply: false },
    });
 
    // ── Email értesítők ───────────────────────────────────────
    // Párhuzamosan küldjük, egyik sem blokkolja a másikat
    await Promise.allSettled([
      // 1. Usernek: visszaigazolás hogy megkaptuk
      sendGuestChatConfirmationEmail(
        guestSession.email,
        guestSession.name,
        body.trim(),
      ).catch(e => console.error("User visszaigazoló email hiba:", e)),
 
      // 2. Adminnak: értesítő az új üzenetről
      sendGuestChatAdminNotificationEmail(
        "optikartofficial@gmail.com",
        guestSession.name,
        guestSession.email,
        body.trim(),
        guestSession.id,
      ).catch(e => console.error("Admin értesítő email hiba:", e)),
    ]);
 
    return NextResponse.json({ ok: true, sessionId: guestSession.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/chat/guest]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}