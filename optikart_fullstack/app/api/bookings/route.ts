// /api/bookings – Route Handler (App Router).
// Ez a fájl *szerveren* fut. Itt tudunk:
// - session-t ellenőrizni (getServerSession)
// - Prisma-val DB-t olvasni/írni

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { clientId: session.user.id },
    orderBy: { startTime: "desc" },
    include: { service: { include: { category: true } } },
  });

  return NextResponse.json({ bookings });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  // A request body-t JSON-ként olvassuk (kliens oldali fetch küldi).
  const body = (await req.json()) as {
    serviceId?: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
  };

  if (!body.serviceId || !body.startTime || !body.endTime) {
    return NextResponse.json(
      { error: "Missing fields: serviceId, startTime, endTime" },
      { status: 400 },
    );
  }

  const start = new Date(body.startTime);
  const end = new Date(body.endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return NextResponse.json({ error: "Invalid time range" }, { status: 400 });
  }

  const booking = await prisma.booking.create({
    data: {
      clientId: session.user.id,
      serviceId: body.serviceId,
      startTime: start,
      endTime: end,
      notes: body.notes?.trim() || null,
    },
    include: { service: { include: { category: true } } },
  });

  return NextResponse.json({ booking }, { status: 201 });
}

