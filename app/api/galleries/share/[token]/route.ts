// app/api/galleries/share/[token]/route.ts
// VÁLTOZÁS: project.id is benne van a válaszban (vissza gombhoz)

import { NextResponse } from "next/server";
import prisma           from "@/lib/db";
import { auth }         from "@/auth";
import bcrypt           from "bcryptjs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token }        = await params;
    const { searchParams } = new URL(req.url);
    const password         = searchParams.get("password");

    const gallery = await prisma.gallery.findUnique({
      where:   { shareToken: token },
      include: {
        project: {
          select: {
            id:    true,   // ← ÚJ: vissza gombhoz kell
            name:  true,
            users: { select: { id: true } },
          },
        },
        _count: { select: { images: true } },
      },
    });

    if (!gallery) {
      return NextResponse.json({ error: "Nem található" }, { status: 404 });
    }

    // ── 1. Jogosultság ELŐSZÖR ────────────────────────────────
    let isAdmin = false;
    let isOwner = false;
    try {
      const session = await auth();
      if (session?.user?.id) {
        const userId = parseInt(session.user.id as string);
        isAdmin = (session.user as any)?.role === "ADMIN";
        isOwner = gallery.project.users.some(u => u.id === userId);
      }
    } catch {}

    // ── 2. Lejárat – owner/admin átugorja ───────────────────
    if (!isAdmin && !isOwner) {
      if (gallery.expiresAt && gallery.expiresAt < new Date()) {
        return NextResponse.json(
          {
            error:          "Lejárt",
            googleDriveUrl: gallery.googleDriveUrl ?? null,
            title:          gallery.title,
            projectName:    gallery.project.name,
            expiresAt:      gallery.expiresAt,
          },
          { status: 410 },
        );
      }
    }

    // ── 3. Privát ─────────────────────────────────────────────
    if (!gallery.isPublic && !isAdmin && !isOwner) {
      return NextResponse.json({ error: "Ez a galéria privát" }, { status: 403 });
    }

    // ── 4. Jelszó ─────────────────────────────────────────────
    if (gallery.password && !isAdmin && !isOwner) {
      if (!password) {
        return NextResponse.json({
          locked:         true,
          title:          gallery.title,
          projectName:    gallery.project.name,
          imageCount:     gallery._count.images,
          googleDriveUrl: gallery.googleDriveUrl ?? null,
        });
      }
      const ok = await bcrypt.compare(password, gallery.password);
      if (!ok) {
        return NextResponse.json(
          { error: "Helytelen jelszó", locked: true },
          { status: 401 },
        );
      }
    }

    // ── 5. Tartalom ───────────────────────────────────────────
    const [images, videos] = await Promise.all([
      prisma.galleryImage.findMany({
        where:   { galleryId: gallery.id },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true, thumbnailUrl: true, previewUrl: true,
          fileName: true, width: true, height: true, bytes: true,
        },
      }),
      prisma.galleryVideo.findMany({
        where:   { galleryId: gallery.id },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true, thumbnailUrl: true, streamUrl: true,
          fileName: true, bytes: true, duration: true,
        },
      }).catch(() => []),
    ]);

    const { password: _pw, shareToken: _st, ...safeGallery } = gallery as any;

    return NextResponse.json({
      gallery: {
        ...safeGallery,
        hasPassword: !!gallery.password,
        isExpired:   !!(gallery.expiresAt && gallery.expiresAt < new Date()),
      },
      images,
      videos,
    });
  } catch (err) {
    console.error("[GET /api/galleries/share/[token]]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}