// app/api/galleries/share/[token]/route.ts
// Publikus megosztott galéria elérése shareToken alapján
// Jelszó ellenőrzés is itt történik

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

// ── GET: galéria metaadatok (jelszó nélkül vagy jelszóval) ────
export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const { searchParams } = new URL(req.url);
    const password = searchParams.get("password");

    const gallery = await prisma.gallery.findUnique({
      where: { shareToken: token },
      include: {
        project: { select: { name: true } },
        _count:  { select: { images: true } },
      },
    });

    if (!gallery) return NextResponse.json({ error: "Nem található" }, { status: 404 });
    if (!gallery.isPublic) return NextResponse.json({ error: "Ez a galéria privát" }, { status: 403 });
    if (gallery.expiresAt && gallery.expiresAt < new Date()) {
      return NextResponse.json({ error: "Ez a galéria lejárt" }, { status: 410 });
    }

    // Ha jelszóval védett, de nincs jelszó megadva → csak metadata
    if (gallery.password && !password) {
      return NextResponse.json({
        locked: true,
        title:  gallery.title,
        projectName: gallery.project.name,
        imageCount: gallery._count.images,
      });
    }

    // Jelszó ellenőrzés
    if (gallery.password && password) {
      const ok = await bcrypt.compare(password, gallery.password);
      if (!ok) return NextResponse.json({ error: "Helytelen jelszó", locked: true }, { status: 401 });
    }

    // Képek lekérése (thumbnail + preview URL)
    const images = await prisma.galleryImage.findMany({
      where:   { galleryId: gallery.id },
      orderBy: { sortOrder: "asc" },
      select: {
        id:           true,
        thumbnailUrl: true,
        previewUrl:   true,
        fileName:     true,
        width:        true,
        height:       true,
        bytes:        true,
      },
    });

    const { password: _pw, shareToken: _st, ...safeGallery } = gallery;
    return NextResponse.json({ gallery: safeGallery, images });
  } catch (err) {
    console.error("[GET /api/galleries/share/[token]]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}
