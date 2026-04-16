import { NextResponse } from "next/server";
import prisma           from "@/lib/db";
import { auth }         from "@/auth";
 
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
 
    const { id: rawId } = await params;
    const id     = parseInt(rawId);
    const userId = parseInt(session.user.id as string);
 
    if (isNaN(id)) {
      return NextResponse.json({ error: "Érvénytelen ID" }, { status: 400 });
    }
 
    const project = await prisma.project.findFirst({
      where: {
        id,
        users: { some: { id: userId } }, // csak saját projekt
      },
      include: {
        users:    { select: { id: true, name: true, email: true, phone: true } },
        type:     true,
        category: { include: { bulletPoints: true } },
        calendarEvents: { orderBy: { startTime: "asc" } },
        messages: {
          include: {
            sender:   { select: { id: true, name: true, role: true } },
            receiver: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        galleries: {
          include: {
            images: {
              select: {
                id: true, fileName: true,
                thumbnailUrl: true, previewUrl: true,
              },
              orderBy: { sortOrder: "asc" },
            },
            // ── ÚJ: videók is jönnek ──────────────────────────
            videos: {
              select: {
                id: true, fileName: true,
                thumbnailUrl: true, streamUrl: true,
                bytes: true, duration: true,
              },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });
 
    if (!project) {
      return NextResponse.json({ error: "Nem található" }, { status: 404 });
    }
 
    // Galéria password hash-t ne küldjük ki, de shareToken és googleDriveUrl igen
    const safeProject = {
      ...project,
      galleries: project.galleries.map(({ password, ...g }) => ({
        ...g,
        hasPassword: !!password,
      })),
    };
 
    return NextResponse.json({ project: safeProject });
  } catch (err) {
    console.error("[GET /api/projects/[id]/user]", err);
    return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
  }
}