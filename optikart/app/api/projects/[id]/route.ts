import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return NextResponse.json({ error: "Érvénytelen ID" }, { status: 400 });

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, phone: true } },
        type: true,
        category: { include: { bulletPoints: true } },
        calendarEvents: { orderBy: { startTime: "asc" } },
        galleries: { include: { images: true, imagesFull: true } },
        messages: {
          include: {
            sender:   { select: { id: true, name: true, role: true } },
            receiver: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!project) return NextResponse.json({ error: "Nem található" }, { status: 404 });
    return NextResponse.json({ project });
  } catch (err) {
    console.error("[GET /api/projects/[id]]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return NextResponse.json({ error: "Érvénytelen ID" }, { status: 400 });

    const body = await req.json();
    const { name, description, status, typeId, packageId, paymentStatus, totalPrice } = body;

    const updateData: Record<string, any> = {};
    if (name          !== undefined) updateData.name          = name;
    if (description   !== undefined) updateData.description   = description;
    if (status        !== undefined) updateData.status        = status;
    if (typeId        !== undefined) updateData.typeId        = typeId;
    if (packageId     !== undefined) updateData.packageId     = packageId;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (totalPrice    !== undefined) updateData.totalPrice    = totalPrice;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ project });
  } catch (err) {
    console.error("[PATCH /api/projects/[id]]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return NextResponse.json({ error: "Érvénytelen ID" }, { status: 400 });

    await prisma.message.deleteMany({ where: { projectId: id } });
    await prisma.calendarEvent.deleteMany({ where: { projectId: id } });

    const galleries = await prisma.gallery.findMany({ where: { projectId: id } });
    for (const g of galleries) {
      await prisma.imagesGalleryWbp.deleteMany({ where: { galleryId: g.id } });
      await prisma.imagesFull.deleteMany({ where: { galleryId: g.id } });
    }
    await prisma.gallery.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === "P2025") return NextResponse.json({ error: "Nem található" }, { status: 404 });
    console.error("[DELETE /api/projects/[id]]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}