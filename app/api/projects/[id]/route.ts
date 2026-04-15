import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import { 
  sendPaymentStatusEmail, 
  sendProjectStatusEmail, 
  sendProjectDeletedEmail, 
  sendEventDateChangedEmail
} from "@/lib/email";

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


 
export async function PATCH(req: Request, context: any) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 
    const body = await req.json();
    const {
      name, description, status, paymentStatus, totalPrice,
      eventDate,           // ← ÚJ
      notifyDateChange,    // ← ÚJ: ha true, email küldés
    } = body;
 
    // A régi eventDate lekérése összehasonlításhoz
    const existing = await prisma.project.findUnique({
      where:  { id: parseInt(id) },
      select: {
        eventDate: true,
        name:      true,
        users:     { select: { email: true, name: true } },
      },
    });
    if (!existing) return NextResponse.json({ error: "Nem található" }, { status: 404 });
 
    // Frissítés
    const updated = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        ...(name         !== undefined && { name }),
        ...(description  !== undefined && { description }),
        ...(status       !== undefined && { status }),
        ...(paymentStatus!== undefined && { paymentStatus }),
        ...(totalPrice   !== undefined && { totalPrice }),
        // eventDate kezelés: null = törlés, string = beállítás
        ...(eventDate !== undefined && {
          eventDate: eventDate ? new Date(`${eventDate}T12:00:00.000Z`) : null,
        }),
      },
      include: {
        users:          { select: { id: true, name: true, email: true, phone: true } },
        type:           true,
        category:       { include: { bulletPoints: true } },
        calendarEvents: true,
        galleries:      {
          include: {
            images:     true,
            imagesFull: true,
          },
        },
        messages: {
          include: { sender: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
 
    // ── Email küldés ha a dátum megváltozott és van ügyfél ──
    if (notifyDateChange && eventDate && existing.users.length > 0) {
      const newDate = new Date(`${eventDate}T12:00:00.000Z`);
      const projectName = existing.name ?? "projekt";
 
      // Aszinkron, ne blokkolja a választ
      Promise.all(
        existing.users.map(u =>
          sendEventDateChangedEmail(u.email, u.name ?? "Ügyfelünk", projectName, newDate)
            .catch(e => console.error("[MAIL] eventDate email hiba:", e))
        )
      );
    }
 
    return NextResponse.json({ project: updated });
  } catch (err) {
    console.error(`[PATCH /api/projects/${id}]`, err);
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

    // 1. Lekérjük a projektet és a júzereket a törlés előtt, hogy tudjunk emailt küldeni
    const projectToDelete = await prisma.project.findUnique({
      where: { id },
      include: { users: true }
    });

    if (!projectToDelete) return NextResponse.json({ error: "Nem található" }, { status: 404 });

    // 2. Email értesítések kiküldése a törlésről
    const emailPromises = projectToDelete.users.map(user => 
      sendProjectDeletedEmail(user.email, user.name || "Ügyfelünk", projectToDelete.name || "Projekt")
    );
    
    // Megvárjuk, amíg az emailek elmennek (vagy legalább a küldés elindul)
    await Promise.all(emailPromises).catch(err => console.error("Hiba a törlési értesítő küldésekor:", err));

    // 3. Adatbázis takarítás (Prisma cascade delete hiányában manuálisan)
    await prisma.message.deleteMany({ where: { projectId: id } });
    await prisma.calendarEvent.deleteMany({ where: { projectId: id } });

    const galleries = await prisma.gallery.findMany({ where: { projectId: id } });
    for (const g of galleries) {
      await prisma.imagesGalleryWbp.deleteMany({ where: { galleryId: g.id } });
      await prisma.imagesFull.deleteMany({ where: { galleryId: g.id } });
    }
    await prisma.gallery.deleteMany({ where: { projectId: id } });
    
    // Végül a projekt törlése
    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === "P2025") return NextResponse.json({ error: "Nem található" }, { status: 404 });
    console.error("[DELETE /api/projects/[id]]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}