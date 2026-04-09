import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import { 
  sendPaymentStatusEmail, 
  sendProjectStatusEmail, 
  sendProjectDeletedEmail 
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

    // --- MAGYARÍTÁS ÉS SZÍNEK (A beküldött képek alapján) ---
    
    const projectStatusConfig: Record<string, { label: string; color: string }> = {
      PLANNING:    { label: "TERVEZÉS",     color: "#A08060" }, // Aranybarna/Szürke
      IN_PROGRESS: { label: "FOLYAMATBAN", color: "#3498db" }, // Kék
      COMPLETED:   { label: "KÉSZ",        color: "#27ae60" }, // Zöld
      ON_HOLD:     { label: "FELFÜGGESZTVE", color: "#f1c40f" }, // Sárga/Narancs
      CANCELLED:   { label: "TÖRÖLVE",      color: "#e74c3c" }  // Piros
    };

    const paymentStatusConfig: Record<string, { label: string; color: string }> = {
      PENDING:  { label: "FÜGGŐBEN",     color: "#f39c12" }, // Sárgás/Narancs
      PAID:     { label: "FIZETVE",      color: "#2ecc71" }, // Zöld
      OVERDUE:  { label: "LEJÁRT",       color: "#c0392b" }, // Piros
      REFUNDED: { label: "VISSZATÉRÍTVE", color: "#9b59b6" }  // Lila/Kék
    };

    // 1. Lekérjük a régi adatokat és a felhasználókat
    const oldProject = await prisma.project.findUnique({
      where: { id },
      include: { users: true }
    });

    if (!oldProject) return NextResponse.json({ error: "Projekt nem található" }, { status: 404 });

    // 2. Frissítendő adatok összeállítása
    const updateData: Record<string, any> = {};
    if (name !== undefined)          updateData.name = name;
    if (description !== undefined)   updateData.description = description;
    if (status !== undefined)        updateData.status = status;
    if (typeId !== undefined)        updateData.typeId = typeId;
    if (packageId !== undefined)     updateData.packageId = packageId;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (totalPrice !== undefined)    updateData.totalPrice = totalPrice;

    // 3. Mentés az adatbázisba
    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    // --- EMAIL KÜLDÉSI LOGIKA ---
    const emailPromises = [];

    // PROJEKT STÁTUSZ VÁLTOZÁS
    if (status && status !== oldProject.status) {
      const config = projectStatusConfig[status] || { label: status, color: "#1a1a1a" };
      for (const user of oldProject.users) {
        emailPromises.push(
          sendProjectStatusEmail(
            user.email, 
            user.name || "Ügyfelünk", 
            updatedProject.name || "Projekt", 
            config.label, 
            config.color
          )
        );
      }
    }

    // FIZETÉSI STÁTUSZ VÁLTOZÁS
    if (paymentStatus && paymentStatus !== oldProject.paymentStatus) {
      const config = paymentStatusConfig[paymentStatus] || { label: paymentStatus, color: "#1a1a1a" };
      for (const user of oldProject.users) {
        emailPromises.push(
          sendPaymentStatusEmail(
            user.email, 
            user.name || "Ügyfelünk", 
            updatedProject.name || "Projekt", 
            config.label, 
            config.color
          )
        );
      }
    }

    // Emailek indítása (nem várjuk meg a választ az API válaszhoz, hogy gyors legyen)
    if (emailPromises.length > 0) {
      Promise.all(emailPromises).catch(err => console.error("API Email hiba:", err));
    }

    return NextResponse.json({ project: updatedProject });
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