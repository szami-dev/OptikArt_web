// app/api/galleries/[id]/images/route.ts
// POST: kép hozzáadása (Cloudinary public_id alapján, feltöltés után)
// DELETE: kép törlése

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import { deleteCloudinaryImage, buildThumbnailUrl, buildPreviewUrl } from "@/lib/cloudinary";

// ── POST: kép regisztrálása Cloudinary feltöltés után ─────────
// A böngésző feltölt Cloudinary-ra, majd ezt az endpointot hívja
// a metaadatok DB-be mentéséhez.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { images } = await req.json();
    // images: Array<{ publicId, originalUrl, fileName, width, height, bytes }>

    if (!images?.length) {
      return NextResponse.json({ error: "Nincs kép adat" }, { status: 400 });
    }

    const galleryId = parseInt(id);

    // Aktuális legnagyobb sortOrder
    const lastImage = await prisma.galleryImage.findFirst({
      where:   { galleryId },
      orderBy: { sortOrder: "desc" },
      select:  { sortOrder: true },
    });
    let nextOrder = (lastImage?.sortOrder ?? -1) + 1;

    // Képek mentése DB-be
    const created = await prisma.galleryImage.createMany({
      data: images.map((img: any) => ({
        galleryId,
        publicId:     img.publicId,
        originalUrl:  img.originalUrl,
        thumbnailUrl: buildThumbnailUrl(img.publicId),
        previewUrl:   buildPreviewUrl(img.publicId),
        fileName:     img.fileName ?? null,
        width:        img.width    ?? null,
        height:       img.height   ?? null,
        bytes:        img.bytes    ?? null,
        sortOrder:    nextOrder++,
      })),
    });

    // Ha az első kép, legyen borítókép
    const gallery = await prisma.gallery.findUnique({ where: { id: galleryId } });
    if (!gallery?.coverImageUrl && images[0]) {
      await prisma.gallery.update({
        where: { id: galleryId },
        data:  { coverImageUrl: buildThumbnailUrl(images[0].publicId) },
      });
    }

    return NextResponse.json({ created: created.count }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/galleries/[id]/images]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

// ── DELETE: kép törlése ───────────────────────────────────────
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageId } = await req.json();

    const image = await prisma.galleryImage.findUnique({
      where: { id: parseInt(imageId) },
    });
    if (!image) return NextResponse.json({ error: "Kép nem található" }, { status: 404 });

    // Cloudinary törlés
    await deleteCloudinaryImage(image.publicId);

    // DB törlés
    await prisma.galleryImage.delete({ where: { id: image.id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/galleries/[id]/images]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}
