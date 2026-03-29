import nodemailer from "nodemailer";
import prisma from "../lib/db";
import { randomUUID } from "crypto";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_PORT === "465",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// ── Token generálás (közös logika) ────────────────────────────
async function createVerificationToken(email: string) {
  const token = randomUUID();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 óra

  await prisma.verificationToken.deleteMany({ where: { email } });
  await prisma.verificationToken.create({ data: { email, token, expires } });

  return token;
}

// ── Regisztrációkor küldött első email ────────────────────────
export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const token = await createVerificationToken(email);
    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

    await transporter.sendMail({
      from: `"OptikArt" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: "Igazold vissza az e-mail címed | OptikArt",
      html: `
        <div style="font-family: 'Helvetica', sans-serif; color: #1A1510; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #EDE8E0; background-color: #FAF8F4;">
          <h1 style="font-weight: 300; color: #1A1510; border-bottom: 1px solid #C8A882; padding-bottom: 20px; font-size: 24px;">Üdvözlünk az OptikArt-nál!</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #7A6A58; margin-top: 30px;">
            Kedves ${name},<br><br>
            Örülünk, hogy csatlakoztál hozzánk! Kérjük, igazold vissza az e-mail címedet:
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${confirmLink}" style="background-color: #1A1510; color: #FFFFFF; padding: 16px 32px; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">
              E-mail cím megerősítése
            </a>
          </div>
          <p style="font-size: 13px; color: #A08060; font-style: italic;">
            A link 1 órán keresztül érvényes. Ha nem te regisztráltál, töröld ezt a levelet.
          </p>
          <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #EDE8E0; font-size: 11px; color: #A08060; text-align: center;">
            © ${new Date().getFullYear()} OptikArt
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

// ── Újraküldéskor küldött email ───────────────────────────────
export async function sendVerificationEmail(email: string, name: string) {
  try {
    const token = await createVerificationToken(email);
    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

    await transporter.sendMail({
      from: `"OptikArt" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: "E-mail megerősítés újraküldve | OptikArt",
      html: `
        <div style="font-family: 'Helvetica', sans-serif; color: #1A1510; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #EDE8E0; background-color: #FAF8F4;">
          <h1 style="font-weight: 300; color: #1A1510; border-bottom: 1px solid #C8A882; padding-bottom: 20px; font-size: 24px;">Megerősítő email újraküldve</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #7A6A58; margin-top: 30px;">
            Kedves ${name ?? "felhasználó"},<br><br>
            Kérésedre újraküldjük a megerősítő linket. Kattints az alábbi gombra a fiókod aktiválásához:
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${confirmLink}" style="background-color: #1A1510; color: #FFFFFF; padding: 16px 32px; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">
              E-mail cím megerősítése
            </a>
          </div>
          <p style="font-size: 13px; color: #A08060; font-style: italic;">
            A link 1 órán keresztül érvényes. Ha nem te kérted ezt, töröld a levelet.
          </p>
          <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #EDE8E0; font-size: 11px; color: #A08060; text-align: center;">
            © ${new Date().getFullYear()} OptikArt
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