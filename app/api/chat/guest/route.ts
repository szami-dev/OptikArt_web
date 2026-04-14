// app/api/chat/guest/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import { createTransport } from "nodemailer";

function mailer() {
  return createTransport({
    host:   process.env.EMAIL_SERVER_HOST,
    port:   parseInt(process.env.EMAIL_SERVER_PORT ?? "587"),
    secure: process.env.EMAIL_SERVER_PORT === "465",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
}

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

    // Admin email értesítés
    try {
      await mailer().sendMail({
        from:    `"OptikArt Chat" <${process.env.EMAIL_SERVER_USER}>`,
        to:      "optikartofficial@gmail.com",
        replyTo: guestSession.email,
        subject: `💬 Új chat üzenet – ${guestSession.name}`,
        html: `
          <div style="font-family:Georgia,serif;max-width:500px;margin:0 auto;color:#1A1510">
            <h2 style="font-weight:300;font-size:1.4rem;margin-bottom:4px">Új chat üzenet</h2>
            <p style="font-size:12px;color:#A08060;margin-bottom:20px">Nem bejelentkezett látogatótól</p>
            <div style="border:1px solid #EDE8E0;padding:16px;margin-bottom:12px">
              <b>${guestSession.name}</b><br/>
              <span style="color:#A08060;font-size:12px">${guestSession.email}</span>
            </div>
            <div style="border:1px solid #EDE8E0;padding:16px;margin-bottom:20px;font-size:13px;line-height:1.7">
              ${body.replace(/\n/g, "<br>")}
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/messages?guest=${guestSession.id}"
               style="background:#1A1510;color:white;padding:10px 20px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;text-decoration:none;display:inline-block">
              Válasz az admin felületen →
            </a>
          </div>`,
      });
    } catch (e) { console.error("Admin email hiba:", e); }

    return NextResponse.json({ ok: true, sessionId: guestSession.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/chat/guest]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}