import { NextResponse } from "next/server";
import prisma from "@/lib/db";
export default function POST() {
    try {
        const project = prisma.project.create({
            data: {
                name: "New Project",
                description: "Project Description",
            },
        });
        return NextResponse.json(project);
    } catch (error) {        
        return NextResponse.json({ error: "HIba a projekt létrehozásakor" }, { status: 500 });
    }
}