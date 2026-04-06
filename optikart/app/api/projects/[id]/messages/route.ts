import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: rawId } = await params;
    const projectId = parseInt(rawId);
    if (isNaN(projectId)) return NextResponse.json({ error: "Érvénytelen ID" }, { status: 400 });

    const senderId = parseInt(session.user.id as string);
    const { content, receiverId } = await req.json();

    if (!content?.trim()) return NextResponse.json({ error: "Üzenet tartalma kötelező" }, { status: 400 });
    if (!receiverId) return NextResponse.json({ error: "Címzett kötelező" }, { status: 400 });

    const message = await prisma.message.create({
      data: {
        projectId,
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects/[id]/messages]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}