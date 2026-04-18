// lib/seo.ts
import type { Metadata } from "next";

const BASE_URL  = process.env.NEXT_PUBLIC_APP_URL ?? "https://optikart.hu";
const SITE_NAME = "OptikArt";
const AUTHOR    = "OptikArt – Szabó Máté";
const OG_DEFAULT = `${BASE_URL}/og/default.jpg`;

export function buildMetadata(override: Partial<Metadata> = {}): Metadata {
  const { openGraph: ogOverride, ...rest } = override;
  return {
    metadataBase:    new URL(BASE_URL),
    applicationName: SITE_NAME,
    authors:         [{ name: AUTHOR, url: BASE_URL }],
    creator:         AUTHOR,
    publisher:       SITE_NAME,
    robots: {
      index:  true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    openGraph: {
      siteName: SITE_NAME,
      locale:   "hu_HU",
      type:     "website",
      ...ogOverride,
    },
    ...rest,
  };
}

export const SEO = {

  // ── Főoldal ─────────────────────────────────────────────────
  home: buildMetadata({
    title:       "Fotós & Videós Stúdió – Kiskunfélegyháza | OptikArt",
    description: "Esküvői fotózás és videózás, portré, rendezvény, marketing és drón felvételek Kiskunfélegyháza és Kecskemét környékén. 8+ év, 320+ referencia.",
    keywords: [
      "fotós kiskunfélegyháza",
      "videós kiskunfélegyháza",
      "fotó videó stúdió bács-kiskun",
      "esküvői fotós kecskemét",
      "drón fotó videó magyarország",
      "OptikArt",
    ],
    openGraph: {
      title:       "OptikArt | Fotós & Videós Stúdió – Kiskunfélegyháza",
      description: "Természetes, időtlen képek és filmek – esküvőtől drónig. 320+ referencia.",
      url:         BASE_URL,
      images:      [{ url: `${BASE_URL}/og/default.jpg`, width: 1200, height: 630, alt: "OptikArt fotós stúdió" }],
    },
    alternates: { canonical: BASE_URL },
  }),

  // ── Esküvő ──────────────────────────────────────────────────
  wedding: buildMetadata({
    title:       "Esküvői Fotós & Videós – Kiskunfélegyháza és Magyarország | OptikArt",
    description: "Esküvői fotózás és videózás highlight filmmel. Kiskunfélegyháza, Kecskemét, Csongrád megye. Fotó, videó és kombinált csomagok. Kérj ajánlatot!",
    keywords: [
      "esküvői fotós kiskunfélegyháza",
      "esküvői videós magyarország",
      "highlight film esküvő",
      "esküvői fotó videó csomag",
      "jegyes fotózás kiskunfélegyháza",
      "esküvői fotós bács-kiskun",
      "esküvői fotós csongrád megye",
      "esküvői fotózás mennyibe kerül",
    ],
    openGraph: {
      title:       "Esküvői Fotós & Videós | OptikArt",
      description: "A ti történetetek, örökre megörökítve – highlight filmmel.",
      url:         `${BASE_URL}/wedding`,
      images:      [{ url: `${BASE_URL}/og/wedding.jpg`, width: 1200, height: 630, alt: "Esküvői fotózás kiskunfélegyháza" }],
    },
    alternates: { canonical: `${BASE_URL}/wedding` },
  }),

  // ── Portré ──────────────────────────────────────────────────
  portrait: buildMetadata({
    title:       "Portré Fotózás – Páros, Családi, Egyéni | OptikArt Kiskunfélegyháza",
    description: "Portré fotózás természetes fényben: páros, jegyes, családi, kisbaba és brand fotózás. Kiskunfélegyháza és Kecskemét. Nézd meg a portfóliót!",
    keywords: [
      "portré fotózás kiskunfélegyháza",
      "páros fotózás kecskemét",
      "jegyes fotózás bács-kiskun",
      "családi fotózás kiskunfélegyháza",
      "kisbaba fotózás kiskunfélegyháza",
      "brand fotózás vállalkozóknak",
    ],
    openGraph: {
      title:       "Portré Fotózás | OptikArt",
      description: "Pillantások – arcok, pillanatok, emlékek. Természetes fényben.",
      url:         `${BASE_URL}/portrait`,
      images:      [{ url: `${BASE_URL}/og/portrait.jpg`, width: 1200, height: 630, alt: "Portré fotózás kiskunfélegyháza" }],
    },
    alternates: { canonical: `${BASE_URL}/portrait` },
  }),

  // ── Rendezvény ───────────────────────────────────────────────
  event: buildMetadata({
    title:       "Rendezvény Fotózás & Aftermovie | OptikArt",
    description: "Céges rendezvény, fesztivál, konferencia fotózás és aftermovie videó Magyarországon. Gyors átadás, profi minőség. Kérj ajánlatot!",
    keywords: [
      "rendezvény fotózás magyarország",
      "céges rendezvény fotós",
      "fesztivál fotózás videózás",
      "konferencia fotózás",
      "rendezvény aftermovie készítés",
    ],
    openGraph: {
      title:       "Rendezvény Fotózás & Aftermovie | OptikArt",
      description: "Minden pillanat számít – megörökítjük az energiát.",
      url:         `${BASE_URL}/event`,
      images:      [{ url: `${BASE_URL}/og/event.jpg`, width: 1200, height: 630, alt: "Rendezvény fotózás magyarország" }],
    },
    alternates: { canonical: `${BASE_URL}/event` },
  }),

  // ── Drón ─────────────────────────────────────────────────────
  drone: buildMetadata({
    title:       "Drón Fotózás Engedéllyel – Légifotó & 6K Videó | OptikArt",
    description: "Drón fotózás és videózás A2 CofC engedéllyel, 6K felbontásban. Légifotó ingatlanhoz, esküvőhöz, rendezvényhez. Bács-Kiskun és egész Magyarország.",
    keywords: [
      "drón fotózás engedéllyel magyarország",
      "légifotó bács-kiskun",
      "drón videó esküvő",
      "ingatlan légifotó kiskunfélegyháza",
      "6K drón videó magyarország",
      "drón operátor a2 cofc engedély",
    ],
    openGraph: {
      title:       "Drón Fotózás Engedéllyel | OptikArt",
      description: "A világ felülnézetből – A2 CofC engedéllyel, 6K felbontásban.",
      url:         `${BASE_URL}/drone`,
      images:      [{ url: `${BASE_URL}/og/drone.jpg`, width: 1200, height: 630, alt: "Drón légifotó bács-kiskun" }],
    },
    alternates: { canonical: `${BASE_URL}/drone` },
  }),

  // ── Marketing ────────────────────────────────────────────────
  marketing: buildMetadata({
    title:       "Marketing Fotó & Videó Tartalom – Social Media | OptikArt",
    description: "Marketing fotózás és videógyártás vállalkozásoknak: Instagram Reels, TikTok, brand film, termékfotó. Kiskunfélegyháza. Kérj ajánlatot!",
    keywords: [
      "marketing fotózás vállalkozásoknak",
      "social media tartalom gyártás",
      "brand film készítés magyarország",
      "termékfotózás kiskunfélegyháza",
      "tiktok videó gyártás cég",
      "instagram reels gyártás",
    ],
    openGraph: {
      title:       "Marketing Fotó & Videó | OptikArt",
      description: "Content, ami megállít – Instagram, TikTok, brand film, termékfotó.",
      url:         `${BASE_URL}/marketing`,
      images:      [{ url: `${BASE_URL}/og/marketing.jpg`, width: 1200, height: 630, alt: "Marketing fotózás vállalkozásoknak" }],
    },
    alternates: { canonical: `${BASE_URL}/marketing` },
  }),
};

// ── JSON-LD ───────────────────────────────────────────────────
export const JSONLD = {
  localBusiness: {
    "@context": "https://schema.org",
    "@type":    ["LocalBusiness", "Photographer"],
    name:       "OptikArt",
    description:"Esküvői fotózás és videózás, portré, rendezvény, marketing és drón. 8+ év, 320+ referencia.",
    url:        BASE_URL,
    logo:       `${BASE_URL}/logo.png`,
    telephone:  "+36-XX-XXX-XXXX",  // ← töltsd ki
    email:      "business@optikart.hu",
    address: {
      "@type":         "PostalAddress",
      streetAddress:   "Kállai u. 5",
      addressLocality: "Kiskunfélegyháza",
      postalCode:      "6100",
      addressCountry:  "HU",
    },
    geo: { "@type": "GeoCoordinates", latitude: 46.7103, longitude: 19.8481 },
    sameAs: [
      "https://www.facebook.com/optikart",       // ← frissítsd
      "https://www.instagram.com/optikart_hu",   // ← frissítsd
    ],
    priceRange: "$$",
    areaServed: [
      { "@type": "City", name: "Kiskunfélegyháza" },
      { "@type": "City", name: "Kecskemét" },
      { "@type": "AdministrativeArea", name: "Bács-Kiskun megye" },
      { "@type": "AdministrativeArea", name: "Csongrád megye" },
    ],
  },
  website: {
    "@context": "https://schema.org",
    "@type":    "WebSite",
    name:       SITE_NAME,
    url:        BASE_URL,
  },
  wedding:   { "@context": "https://schema.org", "@type": "Service", name: "Esküvői fotózás és videózás",  provider: { "@type": "LocalBusiness", name: "OptikArt", url: BASE_URL }, url: `${BASE_URL}/wedding`,   areaServed: "Magyarország" },
  portrait:  { "@context": "https://schema.org", "@type": "Service", name: "Portré fotózás",               provider: { "@type": "LocalBusiness", name: "OptikArt", url: BASE_URL }, url: `${BASE_URL}/portrait`,  areaServed: "Magyarország" },
  event:     { "@context": "https://schema.org", "@type": "Service", name: "Rendezvényfotózás",            provider: { "@type": "LocalBusiness", name: "OptikArt", url: BASE_URL }, url: `${BASE_URL}/event`,     areaServed: "Magyarország" },
  drone:     { "@context": "https://schema.org", "@type": "Service", name: "Drón fotózás engedéllyel",     provider: { "@type": "LocalBusiness", name: "OptikArt", url: BASE_URL }, url: `${BASE_URL}/drone`,     areaServed: "Magyarország" },
  marketing: { "@context": "https://schema.org", "@type": "Service", name: "Marketing fotó és videó",      provider: { "@type": "LocalBusiness", name: "OptikArt", url: BASE_URL }, url: `${BASE_URL}/marketing`, areaServed: "Magyarország" },
};