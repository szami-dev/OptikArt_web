// app/api/projects/admin/create/route.ts

import { NextResponse }             from "next/server";
import prisma                       from "@/lib/db";
import { auth }                     from "@/auth";
import { ProjectStatus }            from "@/app/generated/prisma/enums";
import {
  sendAdminCreatedProjectEmail,
  sendAdminNotificationEmail,
} from "@/lib/email";

function buildEventTitle(typeId: number | null, projectName: string): string {
  const labels: Record<number, string> = {
    1: "Esküvő", 2: "Portré fotózás", 3: "Rendezvény",
    4: "Marketing forgatás", 5: "Drón felvétel", 6: "Fotózás",
  };
  return `${typeId ? (labels[typeId] ?? "Fotózás") : "Fotózás"} — ${projectName}`;
}

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

    // ── 1. ProjectType upsert ─────────────────────────────────
    let resolvedTypeId: number | null = null;
    if (typeId) {
      const typeNames: Record<number, string> = {
        1: "Esküvő", 2: "Portré", 3: "Rendezvény",
        4: "Marketing", 5: "Drón", 6: "Egyéb",
      };
      const typeName = typeNames[typeId];
      if (typeName) {
        const type = await prisma.projectType.upsert({
          where:  { id: typeId },
          update: {},
          create: { id: typeId, name: typeName },
        });
        resolvedTypeId = type.id;
      }
    }

    // ── 2. Projekt létrehozása + calendar event ha van dátum ──
    const project = await prisma.project.create({
      data: {
        name,
        description:   description ?? null,
        eventDate:     eventDate ? new Date(`${eventDate}T12:00:00.000Z`) : null,
        status:        (status as ProjectStatus) ?? ProjectStatus.PLANNING,
        paymentStatus: "PENDING",
        totalPrice:    totalPrice ?? null,
        typeId:        resolvedTypeId,
        packageId:     packageId ?? null,
        ...(userId ? { users: { connect: { id: userId } } } : {}),

        // ── Calendar event létrehozása ha van eventDate ───────
        ...(eventDate ? {
          calendarEvents: {
            create: {
              title:     buildEventTitle(resolvedTypeId, name.trim()),
              wholeDay:  true,
              startTime: new Date(`${eventDate}T12:00:00.000Z`),
              endTime:   new Date(`${eventDate}T12:00:00.000Z`),
            },
          },
        } : {}),
      },
    });

    // ── 3. Emailek ────────────────────────────────────────────
    if (userId) {
      try {
        const targetUser = await prisma.user.findUnique({
          where:  { id: userId },
          select: { email: true, name: true },
        });

        if (targetUser?.email) {
          const userName    = targetUser.name ?? "Ügyfelünk";
          const projectName = name.trim();

          await Promise.all([
            sendAdminCreatedProjectEmail(targetUser.email, userName, projectName),
            sendAdminNotificationEmail(
              ["optikartofficial@gmail.com"],
              targetUser.email,
              userName,
              projectName,
              project.id.toString(),
            ),
          ]);

          console.log(`[MAIL] Értesítés kiküldve: ${targetUser.email} – ${projectName}`);
        }
      } catch (mailError) {
        console.error("[MAIL ERROR] admin/create:", mailError);
      }
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects/admin/create]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}