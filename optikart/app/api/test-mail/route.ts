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

    // 2. Verification (Resend)
    await sendVerificationEmail(testEmail, testName);

    // 3. Project Created (Client)
    await sendProjectCreatedEmail(testEmail, testName);

    // 4. Admin Created Project (Client Notification)
    await sendAdminCreatedProjectEmail(testEmail, testName, testProject);

    // 5. Project Deleted
    await sendProjectDeletedEmail(testEmail, testName, testProject);

    // 6. Admin Notification
    await sendAdminNotificationEmail(
        [testEmail], // Ide is a te címedet raktam, hogy lásd a sötét témát is
        "ugyfel@pelda.hu",
        "Kovács János",
        testProject,
        "proj_987654"
    );

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