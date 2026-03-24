import { PrismaClient } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import Image from "next/image";


export default async function Home() {
  const users = await prisma.user.findMany();
  return (
    <div></div>
  );
}
