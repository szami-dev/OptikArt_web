import nodemailer from "nodemailer";
import prisma from "../lib/db";
import { randomUUID } from "crypto";
import Image from "next/image";

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
           <!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Megerősítés</title>
    <style>
        /* Alapértelmezett reset az email kliensekhez */
        body { margin: 0; padding: 0; background-color: #ffffff; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-spacing: 0; width: 100%; }
        td { padding: 0; }
        img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
    </style>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6;">

    <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td style="padding: 50px 20px 30px 20px; text-align: center;">
                <div style="font-size: 28px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px;">
                    Optik<span style="font-weight: 300;">Art</span>
                </div>
            </td>
        </tr>

        <tr>
            <td style="padding: 0 30px 40px 30px;">
                <h2 style="font-size: 22px; font-weight: 600; color: #1a1a1a; margin-bottom: 20px; text-align: center;">
                    Szia ${name}!
                </h2>
                <p style="font-size: 16px; color: #555555; margin-bottom: 25px; text-align: center;">
                    Örülünk, hogy csatlakoztál hozzánk! Célunk, hogy a legmagasabb szintű szakértelmet és stílust ötvözzük a látásod védelmében.
                </p>
                <p style="font-size: 16px; color: #555555; margin-bottom: 35px; text-align: center;">
                    Mielőtt elmerülnél a legújabb kollekcióinkban, kérjük, <strong>igazold vissza az e-mail címedet</strong>:
                </p>

                <table role="presentation" style="margin: 40px auto; width: auto;">
                    <tr>
                        <td align="center" style="border-radius: 4px; background-color: #1A1510;">
                            <a href="${confirmLink}" target="_blank" style="padding: 18px 40px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 2px;">
                                E-mail cím megerősítése
                            </a>
                        </td>
                    </tr>
                </table>

                <p style="font-size: 14px; color: #888888; margin-top: 50px; line-height: 1.6; background-color: #f9f9f9; padding: 20px; border-radius: 4px;">
                    <em>Miért érdemes velünk tartanod?</em><br>
                    • Elsőként értesülhetsz exkluzív keret-kollekcióinkról.<br>
                    • Egyszerűen és gyorsan foglalhatsz időpontot látásvizsgálatra.<br>
                    • Személyre szabott ajánlatokat kaphatsz látásigényeid alapján.
                </p>
            </td>
        </tr>

        <tr>
            <td style="padding: 40px 30px; border-top: 1px solid #eeeeee; background-color: #fafafa;">
                <p style="font-size: 12px; color: #aaaaaa; margin-bottom: 10px;">
                    A biztonságod érdekében a fenti link 1 órán belül lejár. 
                    Ha nem te regisztráltál, kérjük, hagyd figyelmen kívül ezt a levelet.
                </p>
                <p style="font-size: 12px; color: #aaaaaa; margin-bottom: 30px; word-break: break-all;">
                    Ha a gomb nem működik, másold be ezt a linket a böngésződbe:<br>
                    <span style="color: #1A1510;">${confirmLink}</span>
                </p>

                <table role="presentation">
                    <tr>
                        <td style="font-size: 11px; color: #333333; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                            © ${new Date().getFullYear()} OptikArt
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 11px; color: #aaaaaa; padding-top: 5px;">
                            Hagyd, hogy a kép beszéljen
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</body>
</html>
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
        <!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Megerősítő link újraküldése</title>
    <style>
        body { margin: 0; padding: 0; background-color: #ffffff; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-spacing: 0; width: 100%; }
        td { padding: 0; }
        img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
    </style>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6;">

    <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td style="padding: 50px 20px 30px 20px; text-align: center;">
                <div style="font-size: 28px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px;">
                    Optik<span style="font-weight: 300;">Art</span>
                </div>
            </td>
        </tr>

        <tr>
            <td style="padding: 0 30px 40px 30px;">
                <h2 style="font-size: 22px; font-weight: 600; color: #1a1a1a; margin-bottom: 20px; text-align: center;">
                    Szia ${name ?? "felhasználó"}!
                </h2>
                <p style="font-size: 16px; color: #555555; margin-bottom: 25px; text-align: center;">
                    Úgy tűnik, szükséged van a megerősítő linkre. Semmi gond, kérésedre már küldjük is az újat, hogy aktiválhasd a fiókodat és használni tudd a rendszert.
                </p>
                <p style="font-size: 16px; color: #555555; margin-bottom: 35px; text-align: center;">
                    Kattints az alábbi gombra az aktiváláshoz:
                </p>

                <table role="presentation" style="margin: 40px auto; width: auto;">
                    <tr>
                        <td align="center" style="border-radius: 4px; background-color: #1A1510;">
                            <a href="${confirmLink}" target="_blank" style="padding: 18px 40px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 2px;">
                                E-mail cím megerősítése
                            </a>
                        </td>
                    </tr>
                </table>

                <p style="font-size: 14px; color: #888888; margin-top: 50px; text-align: center; font-style: italic;">
                    Ha bármilyen technikai nehézséged akadna a regisztráció során, válaszolj erre az e-mailre, és segítünk!
                </p>
            </td>
        </tr>

        <tr>
            <td style="padding: 40px 30px; border-top: 1px solid #eeeeee; background-color: #fafafa;">
                <p style="font-size: 12px; color: #aaaaaa; margin-bottom: 10px;">
                    A biztonságod érdekében a fenti link 1 órán keresztül érvényes. 
                    Ha nem te kérted az újraküldést, egyszerűen töröld ezt az üzenetet.
                </p>
                <p style="font-size: 12px; color: #aaaaaa; margin-bottom: 30px; word-break: break-all;">
                    Ha a gomb nem kattintható, másold be ezt a linket a böngésződbe:<br>
                    <span style="color: #1A1510;">${confirmLink}</span>
                </p>

                <table role="presentation">
                    <tr>
                        <td style="font-size: 11px; color: #333333; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                            © ${new Date().getFullYear()} OptikArt
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 11px; color: #aaaaaa; padding-top: 5px;">
                            Stílus a látásban • Minőség az optikában
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</body>
</html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Email küldési hiba:", error);
    return { success: false, error };
  }
}
export async function sendProjectCreatedEmail(email: string, name: string) {
  const projectListLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects`;

  await transporter.sendMail({
    from: `"OptikArt" <${process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject: "Sikeres projekt létrehozás | OptikArt",
    html: `
      <!DOCTYPE html>
      <html lang="hu">
      <head>
          <meta charset="UTF-8">
          <style>
              body { margin: 0; padding: 0; background-color: #ffffff; }
              table { border-spacing: 0; width: 100%; }
          </style>
      </head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6;">
          <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <tr>
                  <td style="padding: 50px 20px 30px 20px; text-align: center;">
                     <div style="font-size: 28px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px;">
                    Optik<span style="font-weight: 300;">Art</span>
                </div>
                  </td>
              </tr>
              <tr>
                  <td style="padding: 0 30px 40px 30px;">
                      <h2 style="font-size: 22px; font-weight: 600; color: #1a1a1a; margin-bottom: 20px; text-align: center;">
                          Szia ${name}!
                      </h2>
                      <p style="font-size: 16px; color: #555555; margin-bottom: 25px; text-align: center;">
                          Szuper hír: a projektedet sikeresen rögzítettük a rendszerünkben! Köszönjük a bizalmadat.
                      </p>
                      <p style="font-size: 16px; color: #555555; margin-bottom: 35px; text-align: center;">
                          Munkatársaink hamarosan átnézik a részleteket, és <strong>felvesszük veled a kapcsolatot</strong> az általad megadott elérhetőségeken.
                      </p>
                      <table role="presentation" style="margin: 40px auto; width: auto;">
                          <tr>
                              <td align="center" style="border-radius: 4px; background-color: #1A1510;">
                                  <a href="${projectListLink}" target="_blank" style="padding: 18px 40px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 2px;">
                                      Projektjeim megtekintése
                                  </a>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
              <tr>
                  <td style="padding: 40px 30px; border-top: 1px solid #eeeeee; background-color: #fafafa;">
                      <p style="font-size: 12px; color: #aaaaaa; text-align: center;">
                          © ${new Date().getFullYear()} OptikArt • Stílus a látásban • Minőség az optikában
                      </p>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `,
  });
}

export async function sendAdminCreatedProjectEmail(email: string, name: string, projectName: string) {
  const projectLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects`;

  await transporter.sendMail({
    from: `"OptikArt" <${process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject: "Új projektet hoztunk létre neked | OptikArt",
    html: `
      <!DOCTYPE html>
      <html lang="hu">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6; margin: 0; background-color: #ffffff;">
          <table role="presentation" style="max-width: 600px; margin: 0 auto;">
              <tr>
                  <td style="padding: 50px 20px 30px 20px; text-align: center;">
                      <div style="font-size: 28px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px;">
                    Optik<span style="font-weight: 300;">Art</span>
                </div>
                  </td>
              </tr>
              <tr>
                  <td style="padding: 0 30px 40px 30px;">
                      <h2 style="font-size: 22px; font-weight: 600; color: #1a1a1a; margin-bottom: 20px; text-align: center;">Szia ${name}!</h2>
                      <p style="font-size: 16px; color: #555555; margin-bottom: 25px; text-align: center;">
                          Örömmel értesítünk, hogy létrehoztunk számodra egy új projektet: <br><strong>"${projectName}"</strong>.
                      </p>
                      <p style="font-size: 16px; color: #555555; margin-bottom: 35px; text-align: center;">
                          A projekt részleteit és aktuális állapotát bármikor megtekintheted a fiókodban.
                      </p>
                      <table role="presentation" style="margin: 40px auto; width: auto;">
                          <tr>
                              <td align="center" style="border-radius: 4px; background-color: #1A1510;">
                                  <a href="${projectLink}" target="_blank" style="padding: 18px 40px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; display: inline-block; text-transform: uppercase; letter-spacing: 2px;">Megnyitás</a>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
              <tr><td style="padding: 40px 30px; border-top: 1px solid #eeeeee; background-color: #fafafa; text-align: center; font-size: 12px; color: #aaaaaa;">© ${new Date().getFullYear()} OptikArt</td></tr>
          </table>
      </body>
      </html>
    `,
  });
}

export async function sendProjectDeletedEmail(email: string, name: string, projectName: string) {
  await transporter.sendMail({
    from: `"OptikArt" <${process.env.EMAIL_SERVER_USER}>`,
    to: email,
    subject: "Projekt törölve | OptikArt",
    html: `
      <!DOCTYPE html>
      <html lang="hu">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6; margin: 0; background-color: #ffffff;">
          <table role="presentation" style="max-width: 600px; margin: 0 auto;">
              <tr>
                  <td style="padding: 50px 20px 30px 20px; text-align: center;">
                      <div style="font-size: 28px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px;">
                    Optik<span style="font-weight: 300;">Art</span>
                </div>
                  </td>
              </tr>
              <tr>
                  <td style="padding: 0 30px 40px 30px;">
                      <h2 style="font-size: 22px; font-weight: 600; color: #1a1a1a; margin-bottom: 20px; text-align: center;">Szia ${name}!</h2>
                      <p style="font-size: 16px; color: #555555; margin-bottom: 25px; text-align: center;">
                          Értesítünk, hogy a <strong>"${projectName}"</strong> megnevezésű projektedet töröltük a rendszerünkből.
                      </p>
                      <p style="font-size: 14px; color: #e74c3c; margin-top: 30px; text-align: center; font-weight: 500;">
                          Amennyiben nem te kérted a törlést, kérjük, azonnal vedd fel velünk a kapcsolatot válaszolva erre az e-mailre!
                      </p>
                  </td>
              </tr>
              <tr><td style="padding: 40px 30px; border-top: 1px solid #eeeeee; background-color: #fafafa; text-align: center; font-size: 12px; color: #aaaaaa;">© ${new Date().getFullYear()} OptikArt</td></tr>
          </table>
      </body>
      </html>
    `,
  });
}
export async function sendAdminNotificationEmail(
  userEmail: string, 
  userName: string, 
  projectName: string, 
  projectId: string
) {
  // Az admin felület linkje a projekthez
  const adminLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin/projects/${projectId}`;
  // Ha nincs beállítva ADMIN_EMAIL, küldje a rendszer címére
  //const recipient = process.env.ADMIN_EMAIL || process.env.EMAIL_SERVER_USER;

  try {
    const info = await transporter.sendMail({
      from: `"OptikArt Rendszer" <${process.env.EMAIL_SERVER_USER}>`,
      to: userEmail,
      subject: `🚨 ÚJ PROJEKT: ${projectName} | OptikArt`,
      html: `
        <!DOCTYPE html>
        <html lang="hu">
        <head>
            <meta charset="UTF-8">
            <style>
                body { margin: 0; padding: 0; background-color: #111111; -webkit-text-size-adjust: 100%; }
                table { border-spacing: 0; width: 100%; }
                .content-box { border: 1px solid #333333; border-radius: 8px; background-color: #1a1a1a; }
            </style>
        </head>
        <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #eeeeee; line-height: 1.6; background-color: #111111; margin: 0; padding: 0;">

            <table role="presentation" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <tr>
                    <td style="padding-bottom: 40px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 3px;">
                            Optik<span style="font-weight: 300; color: #A08060;">Art</span> Admin
                        </div>
                        <div style="font-size: 11px; color: #666666; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px;">
                            Rendszerértesítés • Új ügyfélmegkeresés
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="content-box" style="padding: 40px 30px; border: 1px solid #333333; border-radius: 8px; background-color: #1a1a1a;">
                        <h2 style="font-size: 20px; font-weight: 400; color: #ffffff; margin-top: 0; margin-bottom: 30px; border-bottom: 1px solid #333333; padding-bottom: 15px;">
                            Új projekt részletei
                        </h2>
                        
                        <table role="presentation" style="width: 100%; margin-bottom: 30px;">
                            <tr>
                                <td style="padding: 8px 0; color: #888888; font-size: 13px; width: 120px; vertical-align: top;">Ügyfél neve:</td>
                                <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">${userName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #888888; font-size: 13px; vertical-align: top;">E-mail címe:</td>
                                <td style="padding: 8px 0; color: #A08060; font-weight: 500;">${userEmail}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #888888; font-size: 13px; vertical-align: top;">Projekt neve:</td>
                                <td style="padding: 8px 0; color: #ffffff; font-weight: 500;">${projectName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #888888; font-size: 13px; vertical-align: top;">Időpont:</td>
                                <td style="padding: 8px 0; color: #ffffff;">${new Date().toLocaleString('hu-HU')}</td>
                            </tr>
                        </table>

                        <p style="font-size: 14px; color: #aaaaaa; margin-bottom: 35px; line-height: 1.5;">
                            Az ügyfél sikeresen elküldte a projekttervét. Kérjük, tekintsd át a részleteket az adminisztrációs felületen és vedd fel vele a kapcsolatot.
                        </p>

                        <table role="presentation" style="width: 100%;">
                            <tr>
                                <td align="center" style="border-radius: 4px; background-color: #ffffff;">
                                    <a href="${adminLink}" target="_blank" style="padding: 18px 0; font-size: 13px; font-weight: 700; color: #111111; text-decoration: none; display: block; text-transform: uppercase; letter-spacing: 2px;">
                                        Projekt megnyitása
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td style="padding-top: 40px; text-align: center;">
                        <p style="font-size: 11px; color: #444444; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
                            OptikArt Automatikus Értesítő System
                        </p>
                        <p style="font-size: 10px; color: #333333; margin-top: 5px;">
                            ID: ${projectId} • © ${new Date().getFullYear()}
                        </p>
                    </td>
                </tr>
            </table>

        </body>
        </html>
      `,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Hiba az admin értesítés küldésekor:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}