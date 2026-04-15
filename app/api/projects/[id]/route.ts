// app/api/projects/[id]/route.ts

import { NextResponse } from "next/server";
import prisma           from "@/lib/db";
import { auth }         from "@/auth";
import {
  sendPaymentStatusEmail,
  sendProjectStatusEmail,
  sendProjectDeletedEmail,
  sendEventDateChangedEmail,
} from "@/lib/email";

// ── Státusz → magyar szöveg + szín ───────────────────────────
const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PLANNING:    { label: "Tervezés alatt",  color: "#C8A882" },
  IN_PROGRESS: { label: "Folyamatban",     color: "#60A5FA" },
  COMPLETED:   { label: "Elkészült",       color: "#34D399" },
  ON_HOLD:     { label: "Felfüggesztve",   color: "#FBBF24" },
  CANCELLED:   { label: "Törölve",         color: "#F87171" },
};

const PAYMENT_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:  { label: "Függőben",      color: "#FBBF24" },
  PAID:     { label: "Fizetve",       color: "#34D399" },
  OVERDUE:  { label: "Lejárt",        color: "#F87171" },
  REFUNDED: { label: "Visszatérítve", color: "#A78BFA" },
};

// ════════════════════════════════════════════════════════════════
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
        users:          { select: { id: true, name: true, email: true, phone: true } },
        type:           true,
        category:       { include: { bulletPoints: true } },
        calendarEvents: { orderBy: { startTime: "asc" } },
        galleries:      { include: { images: true, imagesFull: true } },
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

// ════════════════════════════════════════════════════════════════
export async function PATCH(req: Request, context: any) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      name, description, status, paymentStatus, totalPrice,
      eventDate,
      notifyDateChange,
    } = body;

    // Régi adatok lekérése összehasonlításhoz
    const existing = await prisma.project.findUnique({
      where:  { id: parseInt(id) },
      select: {
        eventDate:     true,
        name:          true,
        status:        true,
        paymentStatus: true,
        users:         { select: { email: true, name: true } },
      },
    });
    if (!existing) return NextResponse.json({ error: "Nem található" }, { status: 404 });

    // Frissítés
    const updated = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        ...(name          !== undefined && { name }),
        ...(description   !== undefined && { description }),
        ...(status        !== undefined && { status }),
        ...(paymentStatus !== undefined && { paymentStatus }),
        ...(totalPrice    !== undefined && { totalPrice }),
        ...(eventDate !== undefined && {
          eventDate: eventDate ? new Date(`${eventDate}T12:00:00.000Z`) : null,
        }),
      },
      include: {
        users:          { select: { id: true, name: true, email: true, phone: true } },
        type:           true,
        category:       { include: { bulletPoints: true } },
        calendarEvents: true,
        galleries:      { include: { images: true, imagesFull: true } },
        messages: {
          include: { sender: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const projectName = existing.name ?? "projekt";
    const users       = existing.users;

    // ── Emailek – aszinkron, ne blokkolják a választ ──────────
    if (users.length > 0) {

      // 1. Dátum változott
      if (notifyDateChange && eventDate) {
        const newDate = new Date(`${eventDate}T12:00:00.000Z`);
        Promise.all(
          users.map(u =>
            sendEventDateChangedEmail(u.email, u.name ?? "Ügyfelünk", projectName, newDate)
              .catch(e => console.error("[MAIL] eventDate:", e))
          )
        );
      }

      // 2. Projekt státusz változott
      if (status && status !== existing.status) {
        const meta = STATUS_LABEL[status];
        if (meta) {
          Promise.all(
            users.map(u =>
              sendProjectStatusEmail(
                u.email,
                u.name ?? "Ügyfelünk",
                projectName,
                meta.label,
                meta.color,
              ).catch(e => console.error("[MAIL] projectStatus:", e))
            )
          );
        }
      }

      // 3. Fizetési státusz változott
      if (paymentStatus && paymentStatus !== existing.paymentStatus) {
        const meta = PAYMENT_LABEL[paymentStatus];
        if (meta) {
          Promise.all(
            users.map(u =>
              sendPaymentStatusEmail(
                u.email,
                u.name ?? "Ügyfelünk",
                projectName,
                meta.label,
                meta.color,
              ).catch(e => console.error("[MAIL] paymentStatus:", e))
            )
          );
        }
      }
    }

    return NextResponse.json({ project: updated });
  } catch (err) {
    console.error(`[PATCH /api/projects/${id}]`, err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

// ════════════════════════════════════════════════════════════════
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

    const projectToDelete = await prisma.project.findUnique({
      where:   { id },
      include: { users: true },
    });
    if (!projectToDelete) return NextResponse.json({ error: "Nem található" }, { status: 404 });

    // Email értesítések a törlésről
    await Promise.all(
      projectToDelete.users.map(u =>
        sendProjectDeletedEmail(
          u.email,
          u.name ?? "Ügyfelünk",
          projectToDelete.name ?? "projekt",
        ).catch(e => console.error("[MAIL] projectDeleted:", e))
      )
    );

    // Adatbázis takarítás
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