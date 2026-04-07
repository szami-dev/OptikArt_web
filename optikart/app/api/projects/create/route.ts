import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import { ProjectStatus } from "@/app/generated/prisma/enums";
// Feltételezve, hogy itt vannak az e-mail küldő függvényeid
import { sendAdminNotificationEmail, sendProjectCreatedEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nem vagy bejelentkezve" }, { status: 401 });
    }

    const userId = parseInt(session.user.id as string);
    const body = await req.json();
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
          where: { id: typeId },
          update: {},
          create: { id: typeId, name: typeName },
        });
        resolvedTypeId = type.id;
      }
    }

    // ── Csomag ára DB-ből ──────────────────────────────────────
    let resolvedPackageId: number | null = null;
    let packageBasePrice = 0;

    if (packageId) {
      const pkg = await prisma.package.findUnique({
        where: { id: packageId },
        select: { id: true, price: true },
      });
      if (pkg) {
        resolvedPackageId = pkg.id;
        packageBasePrice = pkg.price ?? 0;
      }
    }

    // ── totalPrice számítás ────────────────────────────────────
    const szabadteriFelar = szabadteriFelár ?? 0;
    const kiszallasiFee   = travelFee ?? 0;
    const totalPrice = packageBasePrice + szabadteriFelar + kiszallasiFee;

    // ── Foglalt nap ellenőrzés ─────────────────────────────────
    if (date) {
      const dayStart = new Date(`${date}T00:00:00.000Z`);
      const dayEnd   = new Date(`${date}T23:59:59.000Z`);

      const conflict = await prisma.calendarEvent.findFirst({
        where: { startTime: { gte: dayStart, lte: dayEnd } },
      });

      if (conflict) {
        return NextResponse.json(
          { error: "Ez a nap már foglalt. Kérjük válassz másik időpontot." },
          { status: 409 }
        );
      }
    }

    // ── Projekt létrehozása ────────────────────────────────────
    const project = await prisma.project.create({
      data: {
        name,
        description: [
          description,
          phone     ? `Telefon: ${phone}`          : null,
          location ? `Helyszín: ${location}`      : null,
          kiszallasiFee > 0 ? `Kiszállási díj: ${kiszallasiFee.toLocaleString("hu-HU")} Ft` : null,
        ].filter(Boolean).join("\n\n"),
        status:         ProjectStatus.PLANNING,
        paymentStatus: "PENDING",
        totalPrice:    totalPrice > 0 ? totalPrice : null,
        typeId:        resolvedTypeId,
        packageId:     resolvedPackageId,
        users:         { connect: { id: userId } },

        ...(date ? {
          calendarEvents: {
            create: {
              title:     buildEventTitle(typeId, name),
              wholeDay:  true,
              startTime: new Date(`${date}T12:00:00.000Z`),
              endTime:   new Date(`${date}T12:00:00.000Z`),
            },
          },
        } : {}),
      },
      include: { calendarEvents: true },
    });

    // ── E-mailek küldése ───────────────────────────────────────
    try {
      // Lekérjük a felhasználót az adatbázisból, hogy megkapjuk az e-mailt és nevet
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (user?.email) {
        const userName = user.name || "Ügyfelünk";
        
        // Párhuzamos küldés
        await Promise.all([
          sendProjectCreatedEmail(user.email, userName),
          sendAdminNotificationEmail(
            ["szabomate403@gmail.com", "monostorimark05@gmail.com"],
            user.email,
            userName,
            project.name || "Új projekt",
            project.id.toString()
          )
        ]);
        console.log(`[MAIL] Értesítések kiküldve: ${user.email}`);
      }
    } catch (mailErr) {
      // Csak logoljuk, nem rontjuk el az API választ
      console.error("[MAIL ERROR]", mailErr);
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects/create]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

function buildEventTitle(typeId: number | null, projectName: string): string {
  const labels: Record<number, string> = {
    1: "Esküvő", 2: "Portré fotózás", 3: "Rendezvény",
    4: "Marketing forgatás", 5: "Drón felvétel", 6: "Fotózás",
  };
  return `${typeId ? (labels[typeId] ?? "Fotózás") : "Fotózás"} — ${projectName}`;
}