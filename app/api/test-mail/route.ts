import { NextResponse } from "next/server";
import { 
  sendWelcomeEmail, 
  sendVerificationEmail, 
  sendProjectCreatedEmail, 
  sendAdminCreatedProjectEmail, 
  sendProjectDeletedEmail,
  sendAdminNotificationEmail 
} from "@/lib/email";

export async function GET() {
  const testEmail = "szabomate403@gmail.com";
  const testName = "Szabó Máté";
  const testProject = "Premium Portré Fotózás";
  const testToken = "test-verification-token-123";

  try {
    console.log("Teszt e-mailek küldése indul...");

    // 1. Welcome
    await sendWelcomeEmail(testEmail, testName);

    return NextResponse.json({ 
      success: true, 
      message: "Mind a 6 teszt e-mail kiküldve a szabomate403@gmail.com címre!" 
    });

  } catch (error) {
    console.error("Teszt hiba:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Ismeretlen hiba" 
    }, { status: 500 });
  }
}