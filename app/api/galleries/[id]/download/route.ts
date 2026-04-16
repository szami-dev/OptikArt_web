// app/api/galleries/[id]/download/route.ts

import { NextResponse }                                         from "next/server";
import prisma                                                   from "@/lib/db";
import { auth }                                                 from "@/auth";
import bcrypt                                                   from "bcryptjs";
import {
  buildSignedDownloadUrl,
  buildSignedVideoDownloadUrl,
} from "@/lib/cloudinary";

function safeName(raw: string | null | undefined, fallback: string): string {
  if (!raw || raw.trim() === "") return fallback;
  return raw.trim().replace(/[^\w.\-]/g, "_").replace(/_{2,}/g, "_");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id }                         = await params;
    const galleryId                      = parseInt(id);
    const body                           = await req.json();
    const { imageId, videoId, password } = body;

    const gallery = await prisma.gallery.findUnique({
      where:   { id: galleryId },
      include: { project: { select: { users: { select: { id: true } } } } },
    });
    if (!gallery) return NextResponse.json({ error: "Nem található" }, { status: 404 });

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

    // Letöltés csak bejelentkezett usernek (owner vagy admin)
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Letöltéshez bejelentkezés szükséges" }, { status: 401 });
    }

    // ── 2. Lejárat – owner/admin skip ────────────────────────
    if (!isAdmin && !isOwner) {
      if (gallery.expiresAt && gallery.expiresAt < new Date()) {
        return NextResponse.json({ error: "Ez a galéria lejárt" }, { status: 410 });
      }
    }

    // Jelszó check (owner/admin skip)
    if (gallery.password && !isAdmin && !isOwner) {
      if (!password) return NextResponse.json({ error: "Jelszó szükséges" }, { status: 401 });
      const ok = await bcrypt.compare(password, gallery.password);
      if (!ok) return NextResponse.json({ error: "Helytelen jelszó" }, { status: 401 });
    }

    // ── Egy videó ─────────────────────────────────────────────
    if (videoId) {
      const video = await prisma.galleryVideo.findUnique({
        where: { id: parseInt(videoId) },
      });
      if (!video || video.galleryId !== galleryId) {
        return NextResponse.json({ error: "Videó nem található" }, { status: 404 });
      }

      // Format a DB-ből, fallback mp4
      const fmt      = video.format ?? "mp4";
      const base     = video.publicId.split("/").pop() ?? `video-${video.id}`;
      const fileName = safeName(video.fileName, `${base}.${fmt}`);

      const url = buildSignedVideoDownloadUrl(video.publicId, fileName, 3600, fmt);
      return NextResponse.json({ url, fileName });
    }

    // ── Egy kép ───────────────────────────────────────────────
    if (imageId) {
      const image = await prisma.galleryImage.findUnique({
        where: { id: parseInt(imageId) },
      });
      if (!image || image.galleryId !== galleryId) {
        return NextResponse.json({ error: "Kép nem található" }, { status: 404 });
      }

      const base     = image.publicId.split("/").pop() ?? `photo-${image.id}`;
      const fileName = safeName(image.fileName, `${base}.jpg`);
      const url      = buildSignedDownloadUrl(image.publicId, fileName, 3600);
      return NextResponse.json({ url, fileName });
    }

    // ── Összes fájl ───────────────────────────────────────────
    const [images, videos] = await Promise.all([
      prisma.galleryImage.findMany({ where: { galleryId }, orderBy: { sortOrder: "asc" } }),
      prisma.galleryVideo.findMany({ where: { galleryId }, orderBy: { sortOrder: "asc" } }),
    ]);

    const urls = [
      ...images.map(img => {
        const base = img.publicId.split("/").pop() ?? `photo-${img.id}`;
        const name = safeName(img.fileName, `${base}.jpg`);
        return { id: img.id, type: "image" as const, url: buildSignedDownloadUrl(img.publicId, name, 7200), fileName: name };
      }),
      ...videos.map(v => {
        const fmt  = v.format ?? "mp4";
        const base = v.publicId.split("/").pop() ?? `video-${v.id}`;
        const name = safeName(v.fileName, `${base}.${fmt}`);
        return { id: v.id, type: "video" as const, url: buildSignedVideoDownloadUrl(v.publicId, name, 7200, fmt), fileName: name };
      }),
    ];

    return NextResponse.json({ urls, total: urls.length });
  } catch (err) {
    console.error("[POST /api/galleries/[id]/download]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}