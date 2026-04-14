// app/api/chat/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(req: Request, context: any) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { isRead } = await req.json();

    await prisma.chatMessage.update({
      where: { id: parseInt(id) },
      data:  { isRead: isRead ?? true },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/chat/[id]]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "chat" | "project_message"

    if (type === "project_message") {
      await prisma.message.delete({ where: { id: parseInt(id) } });
    } else {
      await prisma.chatMessage.deleteMany({ where: { parentId: parseInt(id) } });
      await prisma.chatMessage.delete({ where: { id: parseInt(id) } });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/chat/[id]]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}