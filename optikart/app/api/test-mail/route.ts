import { sendWelcomeEmail } from "@/lib/mail";
import { NextResponse } from "next/server";

export async function GET() {
  // Írd be a saját privát email címedet a teszteléshez
  const result = await sendWelcomeEmail("szabomate403@gmail.com", "Teszt Elek");
  
  if (result.success) {
    return NextResponse.json({ message: "Email elküldve!" });
  } else {
    return NextResponse.json({ message: "Hiba történt", error: result.error }, { status: 500 });
  }
}