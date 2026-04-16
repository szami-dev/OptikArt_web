// ════════════════════════════════════════════════════════════════
// 1. app/api/galleries/[id]/videos/route.ts – videó DB mentés
// ════════════════════════════════════════════════════════════════

import { NextResponse }             from "next/server";
import prisma                       from "@/lib/db";
import { auth }                     from "@/auth";
import { deleteCloudinaryVideo }    from "@/lib/cloudinary";

// POST – Cloudinary-ra már feltöltött videó DB-be mentése
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const galleryId = parseInt(id);

    const { videos } = await req.json() as {
      videos: {
        publicId:    string;
        originalUrl: string;
        streamUrl:   string;
        thumbnailUrl?: string;
        fileName:    string;
        bytes:       number;
        duration?:   number;
        width?:      number;
        height?:     number;
        format?:     string;
      }[];
    };

    if (!Array.isArray(videos) || videos.length === 0) {
      return NextResponse.json({ error: "Nincs videó" }, { status: 400 });
    }

    await prisma.galleryVideo.createMany({
      data: videos.map(v => ({
        galleryId,
        publicId:    v.publicId,
        originalUrl: v.originalUrl,
        streamUrl:   v.streamUrl,
        thumbnailUrl: v.thumbnailUrl ?? null,
        fileName:    v.fileName,
        bytes:       v.bytes,
        duration:    v.duration ?? null,
        width:       v.width ?? null,
        height:      v.height ?? null,
        format:      v.format ?? null,
      })),
    });

    // Friss galéria visszaküldése
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      include: {
        images: true,
        videos: true,
      },
    });

    return NextResponse.json({ gallery }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/galleries/[id]/videos]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

// DELETE – videó törlése DB-ből és Cloudinary-ról
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id }     = await params;
    const { videoId } = await req.json();

    const video = await prisma.galleryVideo.findUnique({
      where: { id: parseInt(videoId) },
    });
    if (!video || video.galleryId !== parseInt(id)) {
      return NextResponse.json({ error: "Nem található" }, { status: 404 });
    }

    // Cloudinary-ról törlés
    await deleteCloudinaryVideo(video.publicId).catch(e =>
      console.error("[Cloudinary video delete]", e)
    );

    await prisma.galleryVideo.delete({ where: { id: video.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/galleries/[id]/videos]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}


// ════════════════════════════════════════════════════════════════
// 2. app/api/galleries/[id]/route.ts – PATCH kiegészítés
//    Add hozzá a googleDriveUrl mezőt a meglévő PATCH handler data blokkjához
// ════════════════════════════════════════════════════════════════

// A meglévő PATCH-ben a data objektumba add hozzá:
// ...(googleDriveUrl !== undefined && { googleDriveUrl }),

// Tehát a body destructuringnél:
// const { title, description, isPublic, password, removePassword, expiresAt, googleDriveUrl } = await req.json();

// A prisma update data-ban:
// ...(googleDriveUrl !== undefined && { googleDriveUrl: googleDriveUrl || null }),