// app/api/chat/guest/[sessionId]/route.ts
// POST: admin válasz küldése guest sessionre → email értesítés a guestnek

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import { createTransport } from "nodemailer";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await auth();

    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { body } = await req.json();
    if (!body?.trim()) {
      return NextResponse.json({ error: "Üzenet kötelező" }, { status: 400 });
    }

    // Guest session létezik?
    const guestSession = await prisma.guestChatSession.findUnique({
      where: { id: sessionId },
    });
    if (!guestSession) {
      return NextResponse.json({ error: "Guest session nem található" }, { status: 404 });
    }

    // Válasz mentése
    await prisma.guestChatMessage.create({
      data: {
        sessionId,
        body:         body.trim(),
        isAdminReply: true,
        isRead:       false,
      },
    });

    // Email értesítés a guestnek
    try {
      const transporter = createTransport({
        host:   process.env.EMAIL_SERVER_HOST,
        port:   parseInt(process.env.EMAIL_SERVER_PORT ?? "587"),
        secure: process.env.EMAIL_SERVER_PORT === "465",
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      // Link a chat visszanyitásához (token a localStorage-ban lesz, de linket adunk)
      const chatUrl = `${process.env.NEXT_PUBLIC_APP_URL}/?chat=open&token=${sessionId}`;

      await transporter.sendMail({
        from:    `"OptikArt" <${process.env.EMAIL_FROM}>`,
        to:      guestSession.email,
        subject: `💬 Válasz érkezett az üzenetedre – OptikArt`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; color: #1A1510;">
            <h2 style="font-weight: 300; font-size: 1.5rem; margin-bottom: 4px;">
              Szia, ${guestSession.name}!
            </h2>
            <p style="font-size: 13px; color: #7A6A58; margin-bottom: 24px;">
              Válasz érkezett az üzenetedre az OptikArt csapatától.
            </p>

            <div style="border-left: 3px solid #C8A882; padding: 12px 16px; margin-bottom: 20px; background: #FAF8F4;">
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #A08060; margin-bottom: 8px;">
                OptikArt válasza
              </div>
              <div style="font-size: 14px; line-height: 1.7; color: #1A1510;">
                ${body.replace(/\n/g, "<br>")}
              </div>
            </div>

            <a href="${chatUrl}"
               style="display: inline-block; background: #1A1510; color: white; padding: 12px 24px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; text-decoration: none; margin-bottom: 24px;">
              Válaszolj →
            </a>

            <p style="font-size: 11px; color: #C8B8A0; border-top: 1px solid #EDE8E0; padding-top: 16px;">
              Ezt az üzenetet az OptikArt chat rendszere küldte.
              Ha nem te küldtél üzenetet, hagyd figyelmen kívül.
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Guest email értesítés sikertelen:", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/chat/guest/[sessionId]]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

// GET: egy guest session összes üzenete (admin nézethez)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await auth();

    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guestSession = await prisma.guestChatSession.findUnique({
      where:   { id: sessionId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!guestSession) {
      return NextResponse.json({ error: "Nem található" }, { status: 404 });
    }

    return NextResponse.json({ guestSession });
  } catch (err) {
    console.error("[GET /api/chat/guest/[sessionId]]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}