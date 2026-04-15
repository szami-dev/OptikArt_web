
import { NextResponse }             from "next/server";
import { auth }                     from "@/auth";
import { sendGallerySharedEmail }   from "@/lib/email";
 
export async function POST(req: Request, context: any) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
 
    const { clientEmail, clientName, projectName, galleryUrl, hasPassword } = await req.json();
 
    if (!clientEmail) {
      return NextResponse.json({ error: "Nincs megadva ügyfél email cím." }, { status: 400 });
    }
    if (!galleryUrl) {
      return NextResponse.json({ error: "Nincs galéria URL." }, { status: 400 });
    }
 
    await sendGallerySharedEmail(
      clientEmail,
      clientName   ?? "Ügyfelünk",
      projectName  ?? "projekt",
      galleryUrl,
      hasPassword  ?? false,
    );
 
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`[POST /api/galleries/${id}/send]`, err);
    return NextResponse.json({ error: "Szerverhiba az email küldésnél." }, { status: 500 });
  }
}