import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return NextResponse.json({ error: "Érvénytelen ID" }, { status: 400 });

    // Saját magát ne törölhesse
    if (session?.user?.id && parseInt(session.user.id) === id) {
      return NextResponse.json({ error: "Saját fiókodat nem törölheted" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // Prisma P2025: rekord nem létezik
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Felhasználó nem található" }, { status: 404 });
    }
    console.error("[DELETE /api/user/[id]/delete]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}