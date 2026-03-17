import prisma from "@/lib/prisma";

export async function GET() {
  
  return new Response(JSON.stringify("alma"), {
    headers: { "Content-Type": "application/json" },
  });
}
