import { sendWelcomeEmail } from "@/lib/email";
import { sendVerificationEmail, sendProjectDeletedEmail, sendAdminCreatedProjectEmail, sendProjectCreatedEmail, sendAdminNotificationEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Teszteld, hogy a környezeti változók léteznek-e
    if (!process.env.EMAIL_SERVER_USER) {
      return NextResponse.json({ error: "Hiányzik az EMAIL_SERVER_USER .env változó!" }, { status: 500 });
    }

    const result = await sendAdminNotificationEmail(
      "szabomate403@gmail.com", 
      "Szabó Máté", 
      "Save me please <3", 
      "nemcsakanevemnagy32"
    );

    if (result.success) {
      return NextResponse.json({ message: "Email sikeresen elküldve!" });
    } else {
      // Itt a result.error-ban látni fogod a konkrét SMTP hibaüzenetet
      return NextResponse.json({ 
        message: "A küldés sikertelen volt", 
        detail: result.error 
      }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ message: "Váratlan hiba a végponton", error: err }, { status: 500 });
  }
}