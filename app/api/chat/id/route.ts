// app/api/chat/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cascade törli a replies-t is (schema: onDelete: SetNull a parentId-n,
    // de a replies maguk megmaradnak árván – jobb ha kézzel töröljük előbb)
    await prisma.chatMessage.deleteMany({ where: { parentId: parseInt(id) } });
    await prisma.chatMessage.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/chat/[id]]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}