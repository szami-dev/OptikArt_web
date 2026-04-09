// app/api/galleries/route.ts
// GET: összes galéria (admin) vagy saját (user)
// POST: új galéria létrehozása projekthez

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isAdmin  = (session.user as any).role === "ADMIN";
    const userId   = parseInt(session.user.id as string);
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    const where: any = {};
    if (projectId) where.projectId = parseInt(projectId);
    if (!isAdmin)  where.project = { users: { some: { id: userId } } };

    const galleries = await prisma.gallery.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        _count:  { select: { images: true } },
        images:  { select: { id: true, thumbnailUrl: true }, orderBy: { sortOrder: "asc" }, take: 4 },
      },
      orderBy: { createdAt: "desc" },
    });

    // Jelszó hash-t ne küldjük ki
    const safe = galleries.map(({ password, ...g }) => ({
      ...g,
      hasPassword: !!password,
    }));

    return NextResponse.json({ galleries: safe });
  } catch (err) {
    console.error("[GET /api/galleries]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, title, description, password, expiresAt, isPublic } = await req.json();
    if (!projectId) return NextResponse.json({ error: "projectId kötelező" }, { status: 400 });

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const gallery = await prisma.gallery.create({
      data: {
        projectId: parseInt(projectId),
        title:     title     ?? null,
        description: description ?? null,
        password:  hashedPassword,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isPublic:  isPublic  ?? false,
      },
    });

    return NextResponse.json({ gallery }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/galleries]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}