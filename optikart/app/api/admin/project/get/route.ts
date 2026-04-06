import { NextResponse } from "next/server";
import prisma from "@/lib/db";
export default function GET() {
  const projects = prisma.project.findMany();
    return NextResponse.json({ projects });
}