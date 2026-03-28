import nodemailer from "nodemailer";
import prisma from "../lib/db";
import { randomUUID } from "crypto";

// 1. SMTP Konfiguráció
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_PORT === "465", 
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

/**
 * Kiküldi a megerősítő e-mailt és elmenti a tokent az adatbázisba.
 */
export async function sendWelcomeEmail(email: string, name: string) {
  try {
    // 2. Token generálása (UUID v4-nek felel meg, de beépített)
    const token = randomUUID();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 óra múlva lejár

    // 3. Régi tokenek törlése (opcionális, de tiszta lapot ad)
    await prisma.verificationToken.deleteMany({
      where: { email }
    });

    // 4. Az új token mentése az adatbázisba
    await prisma.verificationToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // 5. Megerősítő link összeállítása
    // Fontos: A NEXT_PUBLIC_APP_URL legyen benne a .env fájlodban (pl. http://localhost:3000)
    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

    // 6. Az e-mail elküldése
    await transporter.sendMail({
      from: `"OptikArt" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: "Igazold vissza az e-mail címed | OptikArt",
      html: `
        <div style="font-family: 'Helvetica', sans-serif; color: #1A1510; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #EDE8E0; background-color: #FAF8F4;">
          <h1 style="font-weight: 300; color: #1A1510; border-bottom: 1px solid #C8A882; padding-bottom: 20px; font-size: 24px;">Üdvözlünk az OptikArt-nál!</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #7A6A58; margin-top: 30px;">
            Kedves ${name},<br><br>
            Örülünk, hogy csatlakoztál hozzánk! Ahhoz, hogy aktiválhassuk a fiókodat, kérjük, igazold vissza az e-mail címedet az alábbi gombra kattintva:
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${confirmLink}" 
               style="background-color: #1A1510; color: #FFFFFF; padding: 16px 32px; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; display: inline-block; transition: background-color 0.3s;">
               E-mail cím megerősítése
            </a>
          </div>

          <p style="font-size: 13px; color: #A08060; font-style: italic;">
            A fenti link 1 órán keresztül érvényes. Ha nem te regisztráltál, nyugodtan töröld ezt a levelet.
          </p>

          <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #EDE8E0; font-size: 11px; color: #A08060; text-align: center;">
            © ${new Date().getFullYear()} OptikArt | Művészet és Technológia találkozása.
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Email küldési hiba:", error);
    return { success: false, error };
  }
}