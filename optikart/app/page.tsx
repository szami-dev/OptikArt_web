import prisma from "@/lib/db";
import Image from "next/image";

export default async function Home() {
  const users = await prisma.user.findMany();
  console.log(users);
  
  return (
    <div>

      <h1 className="text-2xl font-bold">Users</h1>
      {users.map((user) => (
        <div key={user.id}>
          <h1 className="text-xl font-semibold">{user.name}</h1>
          <p>{user.email}</p>
          <p>{user.role}</p>
          <p>{user.isVerified ? "Verified" : "Not Verified"}</p>
        </div>
      ))}
    </div>
  );
}
