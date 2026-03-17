import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
//import { role } from "@schema.prisma"; // Importáljuk a role enumot a schema.prisma fájlból

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
  {
    name: "Szabó Máté",
    email: "szabo.mate@prisma.io",
    role: "ADMIN", // Használjuk a role enum értékét
    phone: "+36309221702",
    password: "Gum55NDx",
  }
  
];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();