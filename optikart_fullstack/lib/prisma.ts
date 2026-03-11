// Szerver oldali segéd: PrismaClient singleton.
// Next.js dev módban a hot-reload miatt a fájl többször lefuthat, ezért
// globálisan tároljuk az instance-t, hogy ne nyissunk túl sok DB kapcsolatot.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // opcionális: logolás fejlesztéshez
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

