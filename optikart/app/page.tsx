import prisma from "@/lib/db";
import Image from "next/image";

export default async function Home() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-500 p-6 text-white">1. kártya</div>
        <div className="bg-green-500 p-6 text-white">2. kártya</div>
        <div className="bg-red-500 p-6 text-white">3. kártya</div>
      </div>
    </div>
  );
}
