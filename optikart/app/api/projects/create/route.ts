import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";

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

    // Ha typeId nincs az adatbázisban, hozzuk létre menet közben
    // (a hardcoded adatokhoz nem kell előre seedelni)
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

    // Package upsert szintén
    let resolvedPackageId: number | null = null;
    if (packageId) {
      const packageNames: Record<number, { name: string; categoryId: number }> = {
        11: { name: "Alap csomag", categoryId: 1 },
        12: { name: "Standard csomag", categoryId: 1 },
        13: { name: "Prémium csomag", categoryId: 1 },
        21: { name: "Mini portré", categoryId: 2 },
        22: { name: "Standard portré", categoryId: 2 },
        23: { name: "Prémium portré", categoryId: 2 },
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
        // Category upsert
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

    const project = await prisma.project.create({
      data: {
        name,
        description: [
          description,
          phone ? `Telefon: ${phone}` : null,
          date ? `Tervezett időpont: ${date}` : null,
        ].filter(Boolean).join("\n\n"),
        status: "PLANNING",
        typeId: resolvedTypeId,
        packageId: resolvedPackageId,
        users: { connect: { id: userId } },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects/create]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}