import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import { ProjectStatus } from "@/app/generated/prisma/enums";
import { sendAdminNotificationEmail } from "@/lib/email";


export async function POST(req: Request) {
  try {
    
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nem vagy bejelentkezve" }, { status: 401 });
    }

    const userId = parseInt(session.user.id as string);
    const body = await req.json();
    const { name, description, typeId, packageId, date, phone } = body;

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
          where: { id: typeId },
          update: {},
          create: { id: typeId, name: typeName },
        });
        resolvedTypeId = type.id;
      }
    }

    // ── Package + Category upsert ──────────────────────────────
    let resolvedPackageId: number | null = null;
    if (packageId) {
      const packageNames: Record<number, { name: string; categoryId: number }> = {
        11: { name: "Alap fotó", categoryId: 1 },
        12: { name: "Standard fotó", categoryId: 1 },
        13: { name: "Prémium fotó", categoryId: 1 },
        14: { name: "Alap videó", categoryId: 1 },
        15: { name: "Standard videó", categoryId: 1 },
        16: { name: "Prémium videó", categoryId: 1 },
        17: { name: "Alap kombinált", categoryId: 1 },
        18: { name: "Standard kombinált", categoryId: 1 },
        19: { name: "Prémium kombinált", categoryId: 1 },
        21: { name: "Mini páros", categoryId: 2 },
        22: { name: "Standard páros", categoryId: 2 },
        23: { name: "Prémium páros", categoryId: 2 },
        24: { name: "Mini família", categoryId: 2 },
        25: { name: "Standard família", categoryId: 2 },
        26: { name: "Prémium família", categoryId: 2 },
        27: { name: "Mini egyéni", categoryId: 2 },
        28: { name: "Standard egyéni", categoryId: 2 },
        29: { name: "Prémium egyéni", categoryId: 2 },
        31: { name: "Alap csomag", categoryId: 3 },
        32: { name: "Standard csomag", categoryId: 3 },
        33: { name: "Prémium csomag", categoryId: 3 },
        41: { name: "Alap csomag", categoryId: 4 },
        42: { name: "Growth csomag", categoryId: 4 },
        43: { name: "Pro csomag", categoryId: 4 },
        51: { name: "Alap csomag", categoryId: 5 },
        52: { name: "Standard csomag", categoryId: 5 },
        53: { name: "Prémium csomag", categoryId: 5 },
        61: { name: "Egyedi árajánlat", categoryId: 6 },
      };
      const pkgData = packageNames[packageId];
      if (pkgData) {
        const categoryNames: Record<number, string> = {
          1: "Esküvő", 2: "Portré", 3: "Rendezvény",
          4: "Marketing", 5: "Drón", 6: "Egyéb",
        };
        await prisma.category.upsert({
          where: { id: pkgData.categoryId },
          update: {},
          create: { id: pkgData.categoryId, name: categoryNames[pkgData.categoryId] },
        });
        const pkg = await prisma.package.upsert({
          where: { id: packageId },
          update: {},
          create: { id: packageId, name: pkgData.name, categoryId: pkgData.categoryId },
        });
        resolvedPackageId = pkg.id;
      }
    }

    // ── Foglalt nap ellenőrzés szerver oldalon ────────────────
    // Minden esetre lefed: endTime null is lehet (egész napos admin esemény)
    if (date) {
      const dayStart = new Date(`${date}T00:00:00.000Z`);
      const dayEnd   = new Date(`${date}T23:59:59.000Z`);

      const conflict = await prisma.calendarEvent.findFirst({
        where: {
          // Az esemény startTime-ja az adott napra esik
          startTime: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      if (conflict) {
        return NextResponse.json(
          { error: "Ez a nap már foglalt. Kérjük válassz másik időpontot." },
          { status: 409 }
        );
      }
    }

    // ── Projekt létrehozása CalendarEvent nested create-tel ────
    //
    // A Prisma séma szerint:
    //   Project → calendarEvents: CalendarEvent[]  (1-N reláció)
    //   CalendarEvent → projectId: Int?  (idegen kulcs)
    //
    // A nested create automatikusan beállítja a projectId-t,
    // így az esemény azonnal a projekthez lesz kötve.
    const project = await prisma.project.create({
      data: {
        name,
        description: [
          description,
          phone ? `Telefon: ${phone}` : null,
        ].filter(Boolean).join("\n\n"),
        status: ProjectStatus.PLANNING,
        typeId: resolvedTypeId,
        packageId: resolvedPackageId,
        users: { connect: { id: userId } },

        // CalendarEvent csak akkor jön létre, ha a user választott dátumot
        ...(date ? {
          calendarEvents: {
            create: {
              title: buildEventTitle(typeId, name),
              // Egész napos esemény – a user csak napot jelöl, nem órát
              wholeDay: true,
              startTime: new Date(`${date}T12:00:00.000Z`),
              endTime:   new Date(`${date}T12:00:00.000Z`),
            },
          },
        } : {}),
      },
      include: {
        calendarEvents: true,
      },
    });
    // ── Értesítő email küldése adminoknak ───────────────────────
    await sendAdminNotificationEmail(
      "", "", "", ""
    );

    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects/create]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

// ── Esemény cím: típus + projekt neve ─────────────────────────
function buildEventTitle(typeId: number | null, projectName: string): string {
  const labels: Record<number, string> = {
    1: "Esküvő",
    2: "Portré fotózás",
    3: "Rendezvény",
    4: "Marketing forgatás",
    5: "Drón felvétel",
    6: "Fotózás",
  };
  const label = typeId ? (labels[typeId] ?? "Fotózás") : "Fotózás";
  return `${label} — ${projectName}`;
}