// app/api/projects/create/route.ts

import { NextResponse }   from "next/server";
import prisma             from "@/lib/db";
import { auth }           from "@/auth";
import { ProjectStatus }  from "@/app/generated/prisma/enums";
import {
  sendAdminNotificationEmail,
  sendAdminCreatedProjectEmail,
  sendProjectCreatedEmail
} from "@/lib/email";  // ← lib/mail, nem lib/email

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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nem vagy bejelentkezve" }, { status: 401 });
    }

    const userId = parseInt(session.user.id as string);
    const body   = await req.json();
    const {
      name, description, typeId, packageId,
      date, phone, location, travelFee, szabadteriFelár,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "A projekt neve kötelező" }, { status: 400 });
    }

    // ── ProjectType upsert ─────────────────────────────────────
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

    // ── Csomag adatok ──────────────────────────────────────────
    let resolvedPackageId: number | null = null;
    let packageBasePrice  = 0;
    let packageSubtype: string | null = null;

    if (packageId) {
      const pkg = await prisma.package.findUnique({
        where:  { id: packageId },
        select: { id: true, price: true, subtype: true },
      });
      if (pkg) {
        resolvedPackageId = pkg.id;
        packageBasePrice  = pkg.price ?? 0;
        packageSubtype    = pkg.subtype ?? null;
      }
    }

    // ── totalPrice ─────────────────────────────────────────────
    const szabadteriFelar = szabadteriFelár ?? 0;
    const kiszallasiFee   = travelFee ?? 0;
    const totalPrice      = packageBasePrice + szabadteriFelar + kiszallasiFee;

    // ── Foglalt nap ellenőrzés ─────────────────────────────────
    if (date) {
      const dayStart = new Date(`${date}T00:00:00.000Z`);
      const dayEnd   = new Date(`${date}T23:59:59.999Z`);

      const existingEvents = await prisma.calendarEvent.findMany({
        where:  { startTime: { gte: dayStart, lte: dayEnd } },
        select: { id: true, projectId: true },
      });

      if (existingEvents.length > 0) {
        const isEskuvo    = typeId === 1;
        const projectIds  = existingEvents
          .map(e => e.projectId)
          .filter((id): id is number => id !== null);

        let existingSubtypes: (string | null)[] = [];
        if (projectIds.length > 0) {
          const existingProjects = await prisma.project.findMany({
            where:  { id: { in: projectIds } },
            select: { category: { select: { subtype: true } } },
          });
          existingSubtypes = existingProjects.map(p => (p.category as any)?.subtype ?? null);
        }

        if (isEskuvo && (packageSubtype === "foto" || packageSubtype === "video")) {
          const filtered       = existingSubtypes.filter(Boolean) as string[];
          const hasCombinalt   = filtered.includes("kombinalt");
          const hasSameSubtype = filtered.includes(packageSubtype);
          if (hasCombinalt || hasSameSubtype) {
            const reason = hasCombinalt
              ? "Erre a napra már van kombinált esküvői foglalás."
              : `Erre a napra már van ${packageSubtype === "foto" ? "fotós" : "videós"} esküvői foglalás.`;
            return NextResponse.json(
              { error: `${reason} Kérjük válassz másik időpontot.` },
              { status: 409 }
            );
          }
        } else if (isEskuvo && packageSubtype === "kombinalt") {
          return NextResponse.json(
            { error: "Erre a napra már van foglalás. Kombinált csomagnál az egész nap le van foglalva. Kérjük válassz másik időpontot." },
            { status: 409 }
          );
        } else {
          return NextResponse.json(
            { error: "Ez a nap már foglalt. Kérjük válassz másik időpontot." },
            { status: 409 }
          );
        }
      }
    }

    // ── Projekt létrehozása + calendar event ───────────────────
    const project = await prisma.project.create({
      data: {
        name,
        eventDate: date ? new Date(`${date}T12:00:00.000Z`) : null,
        description: [
          description,
          phone           ? `Telefon: ${phone}`                                                    : null,
          location        ? `Helyszín: ${location}`                                                : null,
          kiszallasiFee > 0 ? `Kiszállási díj: ${kiszallasiFee.toLocaleString("hu-HU")} Ft`      : null,
        ].filter(Boolean).join("\n\n"),
        status:        ProjectStatus.PLANNING,
        paymentStatus: "PENDING",
        totalPrice:    totalPrice > 0 ? totalPrice : null,
        typeId:        resolvedTypeId,
        packageId:     resolvedPackageId,
        users:         { connect: { id: userId } },

        // ── Calendar event létrehozása ha van dátum ───────────
        ...(date ? {
          calendarEvents: {
            create: {
              title:     buildEventTitle(resolvedTypeId, name.trim()),
              wholeDay:  true,
              startTime: new Date(`${date}T12:00:00.000Z`),
              endTime:   new Date(`${date}T12:00:00.000Z`),
            },
          },
        } : {}),
      },
      include: {
        calendarEvents: true,
        category: { select: { name: true, subtype: true } },
      },
    });

    // ── E-mailek ───────────────────────────────────────────────
    try {
      const user = await prisma.user.findUnique({
        where:  { id: userId },
        select: { email: true, name: true },
      });

      if (user?.email) {
        const userName = user.name || "Ügyfelünk";
        await Promise.all([
          sendProjectCreatedEmail(user.email, userName),
          sendAdminNotificationEmail(
            ["optikartofficial@gmail.com"],
            user.email,
            userName,
            project.name || "Új projekt",
            project.id.toString(),
          ),
        ]);
        console.log(`[MAIL] Értesítések kiküldve: ${user.email}`);
      }
    } catch (mailErr) {
      console.error("[MAIL ERROR]", mailErr);
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects/create]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}