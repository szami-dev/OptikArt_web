// app/api/chat/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId  = parseInt(session.user.id as string);
    const isAdmin = (session.user as any).role === "ADMIN";
    const { searchParams } = new URL(req.url);
    const projectId  = searchParams.get("projectId");
    const standalone = searchParams.get("standalone");
    const unreadOnly = searchParams.get("unread") === "true";

    // ── ChatMessage-ek ─────────────────────────────────────
    const chatWhere: any = { parentId: null }; // csak top-level üzenetek

    if (!isAdmin) {
      chatWhere.OR = [{ senderId: userId }, { recipientId: userId }];
    }
    if (projectId)             chatWhere.projectId = parseInt(projectId);
    if (standalone === "true") chatWhere.projectId = null;
    if (unreadOnly)            chatWhere.isRead    = false;

    const chatMessages = await prisma.chatMessage.findMany({
      where: chatWhere,
      include: {
        sender:    { select: { id: true, name: true, email: true, role: true } },
        recipient: { select: { id: true, name: true, email: true } },
        project:   { select: { id: true, name: true } },
        // ── Flat thread: minden reply közvetlenül a root gyereke ──
        // Két szint mélyen kérjük le a biztonság kedvéért, de a POST
        // logika garantálja hogy mindig a root a parentId
        replies: {
          where:   { parentId: { not: null } },
          include: {
            sender: { select: { id: true, name: true, role: true } },
            // Ha valaki mégis reply-ra replyzott volna (régi adat),
            // azokat is hozzáfűzzük
            replies: {
              include: {
                sender: { select: { id: true, name: true, role: true } },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Replies flattenelése: reply-ok reply-jait is beillesztjük időrendben
    const flattenedMessages = chatMessages.map(msg => {
      const allReplies: any[] = [];
      for (const r of msg.replies) {
        allReplies.push(r);
        // Ha vannak nested reply-ok (régi adat), azokat is hozzáadjuk
        if (r.replies?.length) {
          allReplies.push(...r.replies);
        }
      }
      // Időrendbe rendezés
      allReplies.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return { ...msg, replies: allReplies, _type: "chat" };
    });

    // ── Message-ek (projekt üzenetek) ──────────────────────
    let projectMessages: any[] = [];
    if (standalone !== "true") {
      const msgWhere: any = {};
      if (!isAdmin) {
        msgWhere.OR = [{ sender_id: userId }, { receiver_id: userId }];
      }
      if (projectId)             msgWhere.projectId = parseInt(projectId);
      if (standalone === "false") msgWhere.projectId = { not: null };

      const msgs = await prisma.message.findMany({
        where: msgWhere,
        include: {
          sender:   { select: { id: true, name: true, email: true, role: true } },
          receiver: { select: { id: true, name: true, email: true } },
          project:  { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      projectMessages = msgs.map(m => ({
        id:           m.id,
        body:         m.content ?? "",
        createdAt:    m.createdAt,
        isRead:       true,
        isAdminReply: m.sender.role === "ADMIN",
        sender:       m.sender,
        recipient:    m.receiver,
        project:      m.project,
        replies:      [],
        _count:       { replies: 0 },
        _type:        "project_message",
      }));
    }

    const allMessages = [
      ...flattenedMessages,
      ...projectMessages,
    ].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const unreadCount = isAdmin
      ? await prisma.chatMessage.count({ where: { isRead: false, isAdminReply: false } })
      : await prisma.chatMessage.count({
          where: {
            isRead: false, isAdminReply: true,
            OR: [{ recipientId: userId }, { senderId: userId }],
          },
        });

    return NextResponse.json({ messages: allMessages, unreadCount });
  } catch (err) {
    console.error("[GET /api/chat]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId  = parseInt(session.user.id as string);
    const isAdmin = (session.user as any).role === "ADMIN";
    const { body, projectId, recipientId, parentId } = await req.json();

    if (!body?.trim()) {
      return NextResponse.json({ error: "Az üzenet nem lehet üres" }, { status: 400 });
    }

    // ── Flat thread logika ────────────────────────────────
    // Mindig a GYÖKÉR üzenet ID-ját adjuk parentId-ként,
    // soha ne legyen reply-ra reply. Így a replies include
    // egyszintű lekéréssel mindig teljes szálat ad vissza.
    let rootParentId: number | null = parentId ? parseInt(parentId) : null;

    if (rootParentId !== null) {
      // Ellenőrizzük hogy a megadott parentId maga is reply-e
      const parent = await prisma.chatMessage.findUnique({
        where:  { id: rootParentId },
        select: { parentId: true },
      });
      // Ha a parent maga is valakinek a gyereke, lépjünk fel a gyökérre
      if (parent?.parentId) {
        rootParentId = parent.parentId;
      }
    }

    const message = await prisma.chatMessage.create({
      data: {
        body,
        senderId:     userId,
        recipientId:  isAdmin ? (recipientId ? parseInt(recipientId) : null) : null,
        projectId:    projectId ? parseInt(projectId) : null,
        parentId:     rootParentId,
        isAdminReply: isAdmin,
        isRead:       false,
      },
      include: {
        sender:    { select: { id: true, name: true, role: true } },
        recipient: { select: { id: true, name: true } },
        project:   { select: { id: true, name: true } },
      },
    });

    // Admin válasznál a root üzenetet olvasottnak jelöljük
    if (isAdmin && rootParentId) {
      await prisma.chatMessage.update({
        where: { id: rootParentId },
        data:  { isRead: true },
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/chat]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}