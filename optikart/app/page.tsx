import prisma from "@/lib/prisma";
import axios from "axios";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">OptikArt</h1>
      <p className="mt-4 text-lg">Üdvözöllek az OptikArt weboldalán!</p>
    </main>
  );
}