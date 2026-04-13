// app/api/chat/route.ts
// GET: üzenetek listája (szűrve)
// POST: új üzenet küldése

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
    const standalone = searchParams.get("standalone"); // "true" = projekthez nem kötött
    const unreadOnly = searchParams.get("unread") === "true";

    const where: any = {
      parentId: null, // csak top-level üzenetek (replies külön jönnek)
    };

    if (!isAdmin) {
      // User csak a saját üzeneteit látja (amit ő küldött vagy neki szólt)
      where.OR = [
        { senderId: userId },
        { recipientId: userId },
      ];
    }

    if (projectId)  where.projectId = parseInt(projectId);
    if (standalone === "true") where.projectId = null;
    if (unreadOnly) where.isRead = false;

    const messages = await prisma.chatMessage.findMany({
      where,
      include: {
        sender:    { select: { id: true, name: true, email: true, role: true } },
        recipient: { select: { id: true, name: true, email: true } },
        project:   { select: { id: true, name: true } },
        replies: {
          include: {
            sender: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Olvasatlan számlálók adminnak
    const unreadCount = isAdmin
      ? await prisma.chatMessage.count({ where: { isRead: false, isAdminReply: false } })
      : await prisma.chatMessage.count({
          where: {
            isRead:       false,
            isAdminReply: true,
            OR: [{ recipientId: userId }, { senderId: userId }],
          },
        });

    return NextResponse.json({ messages, unreadCount });
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

    if (!body?.trim()) return NextResponse.json({ error: "Az üzenet nem lehet üres" }, { status: 400 });

    // Ha admin válaszol, a recipient az eredeti küldő
    // Ha user ír, a recipient null (adminnak szól)
    const message = await prisma.chatMessage.create({
      data: {
        body:         body.trim(),
        senderId:     userId,
        recipientId:  isAdmin ? (recipientId ?? null) : null,
        projectId:    projectId ? parseInt(projectId) : null,
        parentId:     parentId  ? parseInt(parentId)  : null,
        isAdminReply: isAdmin,
        isRead:       false,
      },
      include: {
        sender:    { select: { id: true, name: true, role: true } },
        recipient: { select: { id: true, name: true } },
        project:   { select: { id: true, name: true } },
      },
    });

    // Ha admin válaszol egy threadre, olvasottnak jelöljük az eredetit
    if (isAdmin && parentId) {
      await prisma.chatMessage.update({
        where: { id: parseInt(parentId) },
        data:  { isRead: true },
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/chat]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}
