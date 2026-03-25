import prisma from "@/lib/db";
import Image from "next/image";

export default async function Home() {
  const users = await prisma.user.findMany();
  console.log(users);
  
  return (
    <div>

      <h1 className="text-3xl font-bold mb-4">Welcome to OptikArt!</h1>
      <p className="text-lg mb-6">Discover our wide range of eyewear products and find the perfect pair for you.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <Image src="/assets/eyeglasses.jpg" alt="Eyeglasses" width={400} height={300} className="rounded-md mb-4" />
          <h2 className="text-xl font-semibold mb-2">Stylish Eyeglasses</h2>
          <p>Explore our collection of fashionable eyeglasses that combine style and comfort.</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <Image src="/assets/sunglasses.jpg" alt="Sunglasses" width={400} height={300} className="rounded-md mb-4" />
          <h2 className="text-xl font-semibold mb-2">Trendy Sunglasses</h2>
          <p>Protect your eyes in style with our trendy sunglasses, perfect for any occasion.</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <Image src="/assets/contacts.jpg" alt="Contact Lenses" width={400} height={300} className="rounded-md mb-4" />
          <h2 className="text-xl font-semibold mb-2">Comfortable Contact Lenses</h2>
          <p>Experience the freedom of contact lenses with our comfortable and high-quality options.</p>
        </div>
      </div>
    </div>
  );
}
