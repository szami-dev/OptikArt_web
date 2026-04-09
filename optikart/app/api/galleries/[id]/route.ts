// app/api/galleries/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { deleteCloudinaryImages } from "@/lib/cloudinary";

// ── GET: galéria részletek ─────────────────────────────────────
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isAdmin = (session.user as any).role === "ADMIN";
    const userId  = parseInt(session.user.id as string);

    const gallery = await prisma.gallery.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: { select: { id: true, name: true, users: { select: { id: true } } } },
        images:  { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!gallery) return NextResponse.json({ error: "Nem található" }, { status: 404 });

    // Jogosultság: admin mindent lát, user csak a sajátját
    if (!isAdmin && !gallery.project.users.some(u => u.id === userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { password, ...safe } = gallery;
    return NextResponse.json({ gallery: { ...safe, hasPassword: !!password } });
  } catch (err) {
    console.error("[GET /api/galleries/[id]]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

// ── PATCH: galéria szerkesztés ────────────────────────────────
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, password, removePassword, expiresAt, isPublic, coverImageUrl } = body;

    const data: any = {};
    if (title       !== undefined) data.title       = title;
    if (description !== undefined) data.description = description;
    if (isPublic    !== undefined) data.isPublic    = isPublic;
    if (expiresAt   !== undefined) data.expiresAt   = expiresAt ? new Date(expiresAt) : null;
    if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl;
    if (removePassword) data.password = null;
    else if (password) data.password = await bcrypt.hash(password, 10);

    const gallery = await prisma.gallery.update({
      where: { id: parseInt(id) },
      data,
    });

    const { password: _pw, ...safe } = gallery;
    return NextResponse.json({ gallery: { ...safe, hasPassword: !!_pw } });
  } catch (err) {
    console.error("[PATCH /api/galleries/[id]]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

// ── DELETE: galéria törlése (képek Cloudinary-ról is) ────────
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Képek public ID-jei a Cloudinary törléshez
    const images = await prisma.galleryImage.findMany({
      where:  { galleryId: parseInt(id) },
      select: { publicId: true },
    });

    // Cloudinary törlés
    if (images.length > 0) {
      await deleteCloudinaryImages(images.map(i => i.publicId));
    }

    // DB törlés (cascade törli a GalleryImage-ket is)
    await prisma.gallery.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/galleries/[id]]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}