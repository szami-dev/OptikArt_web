import nodemailer from "nodemailer";
import prisma from "../lib/db";
import { randomUUID } from "crypto";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_PORT === "587",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// --- SEGÉDFÜGGVÉNYEK (Közös sablon és logika) ---

const getBaseTemplate = (content: string, title: string = "OptikArt", dark: boolean = false) => `
  <!DOCTYPE html>
  <html lang="hu">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${dark ? "#eeeeee" : "#333333"}; line-height: 1.6; margin: 0; padding: 0; background-color: ${dark ? "#111111" : "#ffffff"};">
    <table role="presentation" style="max-width: 600px; margin: 0 auto; width: 100%;">
      <tr>
        <td style="padding: 50px 20px 30px 20px; text-align: center;">
          <div style="font-size: 28px; font-weight: 700; color: ${dark ? "#ffffff" : "#1a1a1a"}; text-transform: uppercase; letter-spacing: 3px;">
            Optik<span style="font-weight: 300; color: #A08060;">Art</span>
          </div>
          <div style="font-size: 10px; color: #888888; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">
            Hagyd, hogy a kép beszéljen
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 30px 40px 30px;">
          ${content}
        </td>
      </tr>
      <tr>
        <td style="padding: 40px 30px; border-top: 1px solid ${dark ? "#333333" : "#eeeeee"}; background-color: ${dark ? "#1a1a1a" : "#fafafa"}; text-align: center;">
          <p style="font-size: 11px; color: #aaaaaa; margin: 0;">
            © ${new Date().getFullYear()} OptikArt • Képek & pillanatok, örökre
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

async function sendMailWrapper(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: `"OptikArt" <${process.env.EMAIL_SERVER_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Email hiba:`, error);
    return { success: false, error };
  }
}

async function createVerificationToken(email: string) {
  const token = randomUUID();
  const expires = new Date(Date.now() + 3600 * 1000);
  await prisma.verificationToken.deleteMany({ where: { email } });
  await prisma.verificationToken.create({ data: { email, token, expires } });
  return token;
}

// --- ÜGYFÉL EMAILEK ---

export async function sendWelcomeEmail(email: string, name: string) {
  const token = await createVerificationToken(email);
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
  
  const html = getBaseTemplate(`
    <h2 style="text-align: center; font-weight: 400;">Üdv a csapatban, ${name}!</h2>
    <p style="text-align: center; color: #555555;">Örülünk, hogy minket választottál a vizuális történeteid megörökítéséhez. Legyen szó fotózásról vagy videós gyártásról, készen állunk az alkotásra.</p>
    <p style="text-align: center; margin-top: 25px;"><strong>Kérjük, igazold vissza az e-mail címedet</strong>, hogy elkezdhessük a közös munkát:</p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="${confirmLink}" style="background-color: #1A1510; color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 4px; display: inline-block; text-transform: uppercase; font-size: 12px; font-weight: 600; letter-spacing: 1px;">Fiók aktiválása</a>
    </div>
  `);

  return sendMailWrapper(email, "Aktiváld az OptikArt profilodat", html);
}

// ÚJRAKÜLDÖTT MEGERŐSÍTÉS
export async function sendVerificationEmail(email: string, name: string) {
  const token = await createVerificationToken(email);
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  const html = getBaseTemplate(`
    <h2 style="text-align: center; font-weight: 400;">Szia ${name ?? "Felhasználó"}!</h2>
    <p style="text-align: center; color: #555555;">Úgy tűnik, szükséged van egy új aktiváló linkre a profilodhoz.</p>
    <p style="text-align: center; color: #555555;">Kattints az alábbi gombra, hogy teljes hozzáférést kapj a projektjeidhez:</p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="${confirmLink}" style="background-color: #1A1510; color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 4px; display: inline-block; text-transform: uppercase; font-size: 12px; font-weight: 600;">E-mail megerősítése</a>
    </div>
  `);

  return sendMailWrapper(email, "Új megerősítő link | OptikArt", html);
}

export async function sendProjectCreatedEmail(email: string, name: string) {
  const projectListLink = `${process.env.NEXT_PUBLIC_APP_URL}/user/projects`;
  const html = getBaseTemplate(`
    <h2 style="text-align: center; font-weight: 400;">Szia ${name}!</h2>
    <p style="text-align: center; color: #555555;">Az új projekttervedet sikeresen rögzítettük. Köszönjük a bizalmadat!</p>
    <p style="text-align: center; color: #555555;">Hamarosan átnézzük a részleteket, és felvesszük veled a kapcsolatot, hogy egyeztessünk a technikai igényekről és a megvalósításról.</p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="${projectListLink}" style="background-color: #1A1510; color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 4px; display: inline-block; text-transform: uppercase; font-size: 12px; font-weight: 600;">Projektjeim kezelése</a>
    </div>
  `);
  return sendMailWrapper(email, "Új projektterv leadva | OptikArt", html);
}

export async function sendAdminCreatedProjectEmail(email: string, name: string, projectName: string) {
  const html = getBaseTemplate(`
    <h2 style="text-align: center; font-weight: 400;">Szia ${name}!</h2>
    <p style="text-align: center; color: #555555;">Létrehoztunk számodra egy új munkafelületet a következő projekthez:<br><strong>"${projectName}"</strong></p>
    <p style="text-align: center; color: #555555;">Itt nyomon követheted a munka folyamatát és elérheted a kész anyagokat.</p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/projects" style="background-color: #1A1510; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 4px; display: inline-block; text-transform: uppercase; font-size: 12px;">Projekt megnyitása</a>
    </div>
  `);
  return sendMailWrapper(email, "Új projektet indítottunk neked | OptikArt", html);
}
export async function sendPaymentStatusEmail(
  email: string, 
  name: string, 
  projectName: string, 
  status: string, 
  color: string = "#f39c12" // Alapértelmezett narancs, ha nem jönne szín
) {
  const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/user/projects`;
  
  const html = getBaseTemplate(`
    <h2 style="text-align: center; font-weight: 400;">Pénzügyi értesítés</h2>
    <p style="text-align: center; color: #555555;">Tájékoztatunk, hogy a <strong>"${projectName}"</strong> projekthez kapcsolódó fizetésed állapota megváltozott.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; padding: 12px 30px; background-color: ${color}; color: #ffffff; border-radius: 4px; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        ${status}
      </div>
    </div>

    <p style="text-align: center; color: #555555; font-size: 14px;">A részleteket és a bizonylatokat bármikor elérheted az ügyfélkapun keresztül.</p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${dashboardLink}" style="background-color: #1A1510; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 4px; display: inline-block; text-transform: uppercase; font-size: 12px; font-weight: 600;">Pénzügyi összesítő</a>
    </div>
  `);

  return sendMailWrapper(email, `Fizetési státusz frissítés: ${projectName}`, html);
}
// Példa a projekt státusz emailre a mail.ts-ben
export async function sendProjectStatusEmail(email: string, name: string, projectName: string, status: string, color: string = "#A08060") {
  const projectLink = `${process.env.NEXT_PUBLIC_APP_URL}/user/projects`;

  const html = getBaseTemplate(`
    <h2 style="text-align: center; font-weight: 400;">A projekted szintet lépett</h2>
    <p style="text-align: center; color: #555555;">Szia ${name}, a <strong>"${projectName}"</strong> projekt állapota megváltozott:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; padding: 10px 25px; background-color: ${color}; color: #ffffff; border-radius: 4px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
        ${status}
      </div>
    </div>

    <p style="text-align: center; color: #555555;">Kattints az alábbi gombra a részletekért:</p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${projectLink}" style="background-color: #1A1510; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 4px; display: inline-block; text-transform: uppercase; font-size: 12px;">Projekt megnyitása</a>
    </div>
  `);

  return sendMailWrapper(email, `Státuszfrissítés: ${projectName}`, html);
}

export async function sendGalleryReadyEmail(email: string, name: string, projectName: string, galleryLink: string) {
  const html = getBaseTemplate(`
    <h2 style="text-align: center; font-weight: 400;">Elkészültek a felvételeid!</h2>
    <p style="text-align: center; color: #555555; font-size: 16px;">Kedves ${name}, örömmel értesítünk, hogy a <strong>"${projectName}"</strong> projekt utómunkálataival végeztünk.</p>
    
    <p style="text-align: center; color: #555555;">A válogatott és utómunkázott anyagokat feltöltöttük a személyes galériádba. Bízunk benne, hogy a végeredmény legalább annyira tetszeni fog, mint amennyire mi élveztük a közös alkotást!</p>
    
    <div style="text-align: center; margin: 45px 0;">
      <a href="${galleryLink}" style="background-color: #A08060; color: #ffffff; padding: 20px 45px; text-decoration: none; border-radius: 4px; display: inline-block; text-transform: uppercase; font-size: 14px; font-weight: 700; letter-spacing: 2px; box-shadow: 0 4px 15px rgba(160,128,96,0.3);">Galéria megnyitása</a>
    </div>

    <p style="font-size: 13px; color: #888888; text-align: center; font-style: italic;">
      Tipp: A képeket/videókat érdemes asztali gépen, jó minőségű kijelzőn megnézni az igazi élményért.
    </p>
  `);

  return sendMailWrapper(email, `✨ Elkészült a galériád: ${projectName}`, html);
}

// PROJEKT TÖRLÉSE
export async function sendProjectDeletedEmail(email: string, name: string, projectName: string) {
  const html = getBaseTemplate(`
    <h2 style="text-align: center; font-weight: 400;">Szia ${name}!</h2>
    <p style="text-align: center; color: #555555;">Értesítünk, hogy a <strong>"${projectName}"</strong> megnevezésű projekted törlésre került a rendszerünkből.</p>
    <p style="text-align: center; color: #e74c3c; font-weight: 500; margin-top: 20px;">Amennyiben nem te kérted a törlést, vagy kérdésed van, kérjük, azonnal vedd fel velünk a kapcsolatot elérhetőségeink egyikén.</p>
  `);
  return sendMailWrapper(email, "Projekt eltávolítva | OptikArt", html);
}

// --- ADMIN ÉRTESÍTÉSEK ---

export async function sendAdminNotificationEmail(userEmails: string[], userEmail: string, userName: string, projectName: string, projectId: string) {
  const adminLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin/projects/${projectId}`;
  const html = getBaseTemplate(`
    <h2 style="border-bottom: 1px solid #333333; padding-bottom: 15px; font-weight: 400;">Új vizuális projekt igény</h2>
    <table style="width: 100%; margin: 20px 0; color: #ffffff; font-size: 14px;">
      <tr><td style="padding: 5px 0; color: #888888;">Ügyfél neve:</td><td style="padding: 5px 0;">${userName}</td></tr>
      <tr><td style="padding: 5px 0; color: #888888;">E-mail:</td><td style="padding: 5px 0; color: #A08060;">${userEmail}</td></tr>
      <tr><td style="padding: 5px 0; color: #888888;">Projekt neve:</td><td style="padding: 5px 0;">${projectName}</td></tr>
    </table>
    <div style="text-align: center; margin-top: 30px;">
      <a href="${adminLink}" style="background-color: #ffffff; color: #111111; padding: 15px 0; text-decoration: none; display: block; font-weight: 700; text-transform: uppercase; border-radius: 4px; letter-spacing: 1px;">Adatlap megnyitása</a>
    </div>
  `, "Admin Értesítés", true);

  return sendMailWrapper(userEmails.join(", "), `📸 ÚJ PROJEKT: ${projectName}`, html);
}

export async function sendMessageNotificationEmail(recipientEmail: string, senderName: string, projectName: string, messageContent: string, projectId: string) {
  const projectLink = `${process.env.NEXT_PUBLIC_APP_URL}/user/projects/${projectId}`;
  const html = getBaseTemplate(`
    <p>Szia!</p>
    <p><strong>${senderName}</strong> üzenetet küldött neked a <strong>${projectName}</strong> projekt kapcsán:</p>
    <div style="background-color: #f4f4f4; border-left: 4px solid #A08060; padding: 20px; margin: 25px 0; font-style: italic; color: #333333;">
      "${messageContent}"
    </div>
    <div style="text-align: center;">
      <a href="${projectLink}" style="background-color: #1a1a1a; color: #ffffff; padding: 15px 35px; text-decoration: none; border-radius: 4px; font-weight: 600; display: inline-block; text-transform: uppercase; font-size: 12px;">Válasz küldése</a>
    </div>
  `);
  return sendMailWrapper(recipientEmail, `💬 Új üzenet érkezett: ${projectName}`, html);
}
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string,
) {
  const html = getBaseTemplate(`
    <h2 style="text-align: center; font-weight: 400;">Szia ${name}!</h2>
    <p style="text-align: center; color: #555555;">
      Kaptunk egy jelszó-visszaállítási kérést a fiókoddal kapcsolatban.<br/>
      Kattints az alábbi gombra az új jelszó beállításához.
    </p>
 
    <div style="text-align: center; margin: 40px 0;">
      <a href="${resetUrl}"
        style="background-color: #1A1510; color: #ffffff; padding: 18px 40px;
               text-decoration: none; border-radius: 4px; display: inline-block;
               text-transform: uppercase; font-size: 12px; font-weight: 600;
               letter-spacing: 1px;">
        Jelszó visszaállítása →
      </a>
    </div>
 
    <p style="text-align: center; color: #888888; font-size: 12px;">
      A link <strong>1 óráig</strong> érvényes. Ha nem te kérted,
      egyszerűen hagyd figyelmen kívül — a fiókod biztonságban van.
    </p>
 
    <div style="margin: 30px 0; padding: 16px 20px;
                background-color: #fafafa; border: 1px solid #eeeeee;
                border-radius: 4px;">
      <p style="margin: 0; font-size: 11px; color: #aaaaaa; word-break: break-all;">
        Vagy másold be ezt a linket a böngésződbe:<br/>
        <a href="${resetUrl}" style="color: #A08060;">${resetUrl}</a>
      </p>
    </div>
  `);
 
  return sendMailWrapper(email, "Jelszó visszaállítás | OptikArt", html);
}
 
// ── Sikeres jelszóváltoztatás értesítő ───────────────────────
export async function sendPasswordChangedEmail(
  email: string,
  name: string,
) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`;
 
  const html = getBaseTemplate(`
    <h2 style="text-align: center; font-weight: 400;">Jelszó megváltoztatva</h2>
    <p style="text-align: center; color: #555555;">
      Szia ${name}, a fiókodhoz tartozó jelszó sikeresen megváltozott.
    </p>
 
    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; padding: 12px 28px;
                  background-color: #27ae60; color: #ffffff;
                  border-radius: 4px; font-size: 13px; font-weight: 600;
                  text-transform: uppercase; letter-spacing: 1px;">
        ✓ Jelszó frissítve
      </div>
    </div>
 
    <p style="text-align: center; color: #888888; font-size: 13px;">
      Ha nem te változtattad meg, azonnal vedd fel velünk a kapcsolatot:<br/>
      <a href="mailto:business@optikart.hu" style="color: #A08060;">business@optikart.hu</a>
    </p>
 
    <div style="text-align: center; margin: 35px 0;">
      <a href="${loginUrl}"
        style="background-color: #1A1510; color: #ffffff; padding: 15px 35px;
               text-decoration: none; border-radius: 4px; display: inline-block;
               text-transform: uppercase; font-size: 12px; font-weight: 600;">
        Bejelentkezés
      </a>
    </div>
  `);
 
  return sendMailWrapper(email, "Jelszavad megváltozott | OptikArt", html);
}

export async function sendEventDateChangedEmail(
  email: string,
  name: string,
  projectName: string,
  newDate: Date,
) {
  const projectLink = `${process.env.NEXT_PUBLIC_APP_URL}/user/projects`;
 
  const formattedDate = newDate.toLocaleDateString("hu-HU", {
    year:    "numeric",
    month:   "long",
    day:     "numeric",
    weekday: "long",
  });
 
  const html = getBaseTemplate(`
    <h2 style="text-align: center; font-weight: 400;">Dátumváltozás értesítő</h2>
    <p style="text-align: center; color: #555555;">
      Szia ${name}, a <strong>"${projectName}"</strong> projekt munka dátuma megváltozott.
    </p>
 
    <div style="text-align: center; margin: 35px 0;">
      <div style="display: inline-block; border: 1px solid #C8A882; padding: 24px 40px; background-color: #faf8f4;">
        <div style="font-size: 10px; color: #A08060; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">
          Új dátum
        </div>
        <div style="font-size: 28px; font-weight: 300; color: #1A1510; font-family: Georgia, serif; line-height: 1.2;">
          ${formattedDate}
        </div>
      </div>
    </div>
 
    <p style="text-align: center; color: #888888; font-size: 13px;">
      Ha kérdésed van a változással kapcsolatban, vedd fel velünk a kapcsolatot.
    </p>
 
    <div style="text-align: center; margin: 35px 0;">
      <a href="${projectLink}"
        style="background-color: #1A1510; color: #ffffff; padding: 15px 35px;
               text-decoration: none; border-radius: 4px; display: inline-block;
               text-transform: uppercase; font-size: 12px; font-weight: 600;">
        Projekt megtekintése
      </a>
    </div>
  `);
 
  return sendMailWrapper(email, `Dátumváltozás: ${projectName} | OptikArt`, html);
}
 
// ── Galéria elküldve értesítő ─────────────────────────────────
// Ez a sendGalleryReadyEmail-t váltja ki amikor az admin
// manuálisan rákattint a "Galéria küldése" gombra
export async function sendGallerySharedEmail(
  email: string,
  name: string,
  projectName: string,
  galleryLink: string,
  hasPassword: boolean,
) {
  const html = getBaseTemplate(`
    <h2 style="text-align: center; font-weight: 400;">Elkészültek a felvételeid!</h2>
    <p style="text-align: center; color: #555555; font-size: 16px;">
      Kedves ${name}, örömmel értesítünk, hogy a
      <strong>"${projectName}"</strong> projekt anyagai elkészültek és elérhetők!
    </p>
 
    <p style="text-align: center; color: #555555;">
      A válogatott és utómunkázott anyagokat feltöltöttük a személyes galériádba.
      Bízunk benne, hogy a végeredmény legalább annyira tetszeni fog,
      mint amennyire mi élveztük a közös alkotást!
    </p>
 
    ${hasPassword ? `
    <div style="margin: 25px 0; padding: 16px 20px; background-color: #fafafa;
                border: 1px solid #eeeeee; border-radius: 4px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #888888;">
        🔒 A galéria jelszóvédett. A jelszót egy külön üzenetben küldtük el.
      </p>
    </div>
    ` : ""}
 
    <div style="text-align: center; margin: 45px 0;">
      <a href="${galleryLink}"
        style="background-color: #A08060; color: #ffffff; padding: 20px 45px;
               text-decoration: none; border-radius: 4px; display: inline-block;
               text-transform: uppercase; font-size: 14px; font-weight: 700;
               letter-spacing: 2px; box-shadow: 0 4px 15px rgba(160,128,96,0.3);">
        Galéria megnyitása →
      </a>
    </div>
 
    <p style="font-size: 13px; color: #888888; text-align: center; font-style: italic;">
      Tipp: A képeket érdemes asztali gépen, jó minőségű kijelzőn megnézni az igazi élményért.
    </p>
 
    <div style="margin: 30px 0; padding: 14px 20px; background-color: #fafafa;
                border: 1px solid #eeeeee; border-radius: 4px;">
      <p style="margin: 0; font-size: 11px; color: #aaaaaa; word-break: break-all;">
        Vagy másold be ezt a linket a böngésződbe:<br/>
        <a href="${galleryLink}" style="color: #A08060;">${galleryLink}</a>
      </p>
    </div>
  `);
 
  return sendMailWrapper(email, `✨ Elkészült a galériád: ${projectName} | OptikArt`, html);
}

export async function sendGuestChatConfirmationEmail(
  email: string,
  name: string,
  messageContent: string,
) {
  const html = getBaseTemplate(`
    <h2 style="text-align: center; font-weight: 400;">Köszönjük az üzenetet!</h2>
    <p style="text-align: center; color: #555555;">
      Szia ${name}, megkaptuk az üzenetedet és hamarosan válaszolunk.
    </p>
 
    <div style="background-color: #f4f4f4; border-left: 4px solid #A08060;
                padding: 20px; margin: 25px 0; font-style: italic; color: #555555;
                font-size: 13px; line-height: 1.7;">
      "${messageContent}"
    </div>
 
    <p style="text-align: center; color: #888888; font-size: 13px;">
      Általában <strong>1–2 munkanapon belül</strong> visszajelzünk erre az email címre.<br/>
      Ha sürgős a kérdésed, keress minket közvetlenül:
    </p>
 
    <p style="text-align: center; margin: 20px 0;">
      <a href="mailto:business@optikart.hu"
         style="color: #A08060; font-size: 13px; text-decoration: none;">
        business@optikart.hu
      </a>
    </p>
  `);
 
  return sendMailWrapper(email, "Megkaptuk az üzenetedet | OptikArt", html);
}
 
// ── Vendég chat: admin értesítő email ────────────────────────
// Ez megy az adminnak az új vendég chat üzenetről
export async function sendGuestChatAdminNotificationEmail(
  adminEmail: string,
  guestName: string,
  guestEmail: string,
  messageContent: string,
  sessionId: string,
) {
  const adminLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin/messages?guest=${sessionId}`;
 
  const html = getBaseTemplate(`
    <h2 style="border-bottom: 1px solid #333333; padding-bottom: 15px; font-weight: 400;">
      Új chat üzenet
    </h2>
    <p style="color: #888888; font-size: 12px; margin-top: 0;">Nem bejelentkezett látogatótól</p>
 
    <table style="width: 100%; margin: 20px 0; color: #ffffff; font-size: 14px;">
      <tr>
        <td style="padding: 6px 0; color: #888888; width: 120px;">Feladó neve:</td>
        <td style="padding: 6px 0;">${guestName}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #888888;">E-mail:</td>
        <td style="padding: 6px 0; color: #A08060;">
          <a href="mailto:${guestEmail}" style="color: #A08060;">${guestEmail}</a>
        </td>
      </tr>
    </table>
 
    <div style="border: 1px solid #333333; padding: 16px 20px; margin: 20px 0;
                font-size: 13px; line-height: 1.7; color: #dddddd; font-style: italic;">
      "${messageContent}"
    </div>
 
    <div style="text-align: center; margin-top: 30px;">
      <a href="${adminLink}"
         style="background-color: #ffffff; color: #111111; padding: 15px 35px;
                text-decoration: none; display: inline-block; font-weight: 700;
                text-transform: uppercase; border-radius: 4px; letter-spacing: 1px;
                font-size: 12px;">
        Válasz az admin felületen →
      </a>
    </div>
  `, "Admin Értesítés", true);
 
  return sendMailWrapper(adminEmail, `💬 Új chat üzenet – ${guestName}`, html);
}
