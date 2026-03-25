import prisma from "../lib/db";
import bcrypt from "bcryptjs";

async function main() {
    await prisma.user.deleteMany();
  await prisma.user.createMany({
    data: [
      {
        email: "szabomate403@gmail.com",
        name: "Szabó Máté",
        password: await bcrypt.hash("Gum55NDx", 10),
        phone: "+36309221702",
        emailVerifiedAt: new Date(),
        isVerified: true,
        role: "ADMIN",

      },
      {
        email: "monostorimark05@gmail.com",
        name: "Monostori Márk",
        password: "2T925ivT",
        isVerified: true,
        role: "ADMIN",
      },    
      {
        email: "zugiviktoria@gmail.com",
        name: "Zugi Viktória",
        password: "alma12345",
        isVerified: true,
        role: "ADMIN",      
      },
    ],
  });

  console.log("Seedelés kész!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });