import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import { ProjectStatus } from "@/app/generated/prisma/enums";
// Importáld be a függvényeket onnan, ahol tárolod őket (pl. @/lib/mail)
import { sendAdminNotificationEmail, sendProjectCreatedEmail } from "@/lib/email"; 

export async function POST(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, eventDate, typeId, packageId, status, userId, totalPrice } = body;
    
    if (!name?.trim()) {
      return NextResponse.json({ error: "A projekt neve kötelező" }, { status: 400 });
    }

    // 1. ProjectType upsert (marad az eredeti logikád)
    let resolvedTypeId: number | null = null;
    if (typeId) {
      const typeNames: Record<number, string> = {
        1: "Esküvő", 2: "Portré", 3: "Rendezvény",
        4: "Marketing", 5: "Drón", 6: "Egyéb",
      };
      const typeName = typeNames[typeId];
      if (typeName) {
        const type = await prisma.projectType.upsert({
          where: { id: typeId },
          update: {},
          create: { id: typeId, name: typeName },
        });
        resolvedTypeId = type.id;
      }
    }

    // 2. Projekt létrehozása
    const project = await prisma.project.create({
      data: {
        name,
        description:   description ?? null,
        eventDate:     eventDate ? new Date(`${eventDate}T12:00:00.000Z`) : null,
        status:         (status as ProjectStatus) ?? ProjectStatus.PLANNING,
        paymentStatus: "PENDING",
        totalPrice:    totalPrice ?? null,
        typeId:        resolvedTypeId,
        packageId:     packageId ?? null,
        ...(userId ? { users: { connect: { id: userId } } } : {}),
      },
    });

    // 3. E-mailek küldése (ha van userId)
    if (userId) {
      try {
        // Lekérjük a felhasználó adatait az e-mailhez
        const targetUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true }
        });

        if (targetUser?.email) {
          const userName = targetUser.name || "Ügyfelünk";
          
          // Mindkét e-mailt elküldjük (párhuzamosan, hogy gyorsabb legyen)
          await Promise.all([
            sendProjectCreatedEmail(targetUser.email, userName),
            
          ]);
          
          console.log(`[MAIL] Értesítések kiküldve: ${targetUser.email}`);
        }
      } catch (mailError) {
        // Az e-mail hiba ne rontsa el a sikeres API választ, csak logoljuk
        console.error("[MAIL ERROR]", mailError);
      }
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects/admin/create]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}