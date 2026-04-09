// app/api/galleries/[id]/download/route.ts
// Signed letöltési URL generálás – a fájl Cloudinary-ról jön közvetlenül,
// Vercel EGYÁLTALÁN NEM kezeli a bináris adatot.

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { buildSignedDownloadUrl } from "@/lib/cloudinary";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { imageId, password } = await req.json();

    // Galéria lekérés
    const gallery = await prisma.gallery.findUnique({
      where:   { id: parseInt(id) },
      include: { project: { select: { users: { select: { id: true } } } } },
    });
    if (!gallery) return NextResponse.json({ error: "Nem található" }, { status: 404 });

    // Lejárat ellenőrzés
    if (gallery.expiresAt && gallery.expiresAt < new Date()) {
      return NextResponse.json({ error: "Ez a galéria lejárt" }, { status: 410 });
    }

    // Jogosultság: bejelentkezett user vagy jelszóval védett publikus galéria
    const session = await auth().catch(() => null);
    const isAdmin = session && (session.user as any).role === "ADMIN";
    const isOwner = session && gallery.project.users.some(u => u.id === parseInt(session.user?.id as string));

    if (!isAdmin && !isOwner) {
      // Publikus galériánál jelszó ellenőrzés
      if (!gallery.isPublic) {
        return NextResponse.json({ error: "Nincs hozzáférés" }, { status: 403 });
      }
      if (gallery.password) {
        if (!password) return NextResponse.json({ error: "Jelszó szükséges" }, { status: 401 });
        const ok = await bcrypt.compare(password, gallery.password);
        if (!ok) return NextResponse.json({ error: "Helytelen jelszó" }, { status: 401 });
      }
    }

    // Egy kép letöltése
    if (imageId) {
      const image = await prisma.galleryImage.findUnique({ where: { id: parseInt(imageId) } });
      if (!image) return NextResponse.json({ error: "Kép nem található" }, { status: 404 });

      const url = buildSignedDownloadUrl(
        image.publicId,
        image.fileName ?? `photo-${image.id}.jpg`,
        3600 // 1 óra
      );
      return NextResponse.json({ url, fileName: image.fileName });
    }

    // Összes kép letöltési URL listája
    const images = await prisma.galleryImage.findMany({
      where:   { galleryId: parseInt(id) },
      orderBy: { sortOrder: "asc" },
    });

    const urls = images.map(img => ({
      id:       img.id,
      url:      buildSignedDownloadUrl(img.publicId, img.fileName ?? `photo-${img.id}.jpg`, 3600),
      fileName: img.fileName ?? `photo-${img.id}.jpg`,
    }));

    return NextResponse.json({ urls });
  } catch (err) {
    console.error("[POST /api/galleries/[id]/download]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}
