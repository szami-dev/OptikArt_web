// lib/seo.ts
import type { Metadata } from "next";

const BASE_URL  = process.env.NEXT_PUBLIC_APP_URL ?? "https://optikart.hu";
const SITE_NAME = "OptikArt";
const AUTHOR    = "OptikArt – Szabó Máté";
const OG_DEFAULT = `${BASE_URL}/og/default.jpg`;

// ── buildMetadata – NEM duplikálja az openGraph kulcsot ──────
// A spread operator miatt az override.openGraph felülírja az alapot,
// nem merge-öli. Ezért az openGraph merge-t manuálisan csináljuk.
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
    // OpenGraph alap + override merge – csak EGY openGraph kulcs lesz
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
  home: buildMetadata({
    title:       "OptikArt | Esküvői fotós és videós – Kiskunfélegyháza",
    description: "Esküvői fotózás és videózás, portré, rendezvény, marketing tartalom és drón felvételek Kiskunfélegyháza környékén. Természetes stílus, időtlen képek.",
    keywords:    ["esküvői fotós Kiskunfélegyháza","esküvői fotózás","esküvői videós","highlight film","portré fotós","rendezvényfotózás","drón fotózás","marketing fotó","OptikArt"],
    openGraph: {
      title:       "OptikArt | Esküvői fotós és videós",
      description: "Természetes, időtlen képek és filmek – esküvőtől drónig.",
      url:         BASE_URL,
      images:      [{ url: OG_DEFAULT, width: 1200, height: 630, alt: "OptikArt fotós" }],
    },
    alternates: { canonical: BASE_URL },
  }),

  wedding: buildMetadata({
    title:       "Esküvői fotózás és videózás | OptikArt",
    description: "Professzionális esküvői fotós és videós Kiskunfélegyháza környékén. Fotó, videó és kombinált csomagok – highlight filmmel. Természetes, riport stílus.",
    keywords:    ["esküvői fotós","esküvői videós","esküvői fotózás Kiskunfélegyháza","highlight film esküvő","esküvői fotós Bács-Kiskun","jegyesfotózás"],
    openGraph: {
      title:       "Esküvői fotózás és videózás | OptikArt",
      description: "A ti történetetek, örökre megörökítve.",
      url:         `${BASE_URL}/wedding`,
      images:      [{ url: `${BASE_URL}/og/wedding.jpg`, width: 1200, height: 630, alt: "Esküvői fotózás" }],
    },
    alternates: { canonical: `${BASE_URL}/wedding` },
  }),

  portrait: buildMetadata({
    title:       "Portré fotózás – Páros, Családi, Egyéni | OptikArt",
    description: "Természetes portré fotózás: jegyesfotózás, páros fotózás, családi fotózás és egyéni portré. Szabadtéri és stúdió helyszínen Kiskunfélegyháza környékén.",
    keywords:    ["portré fotózás","páros fotózás","jegyesfotózás","családi fotózás","egyéni portré","portré fotós Kiskunfélegyháza"],
    openGraph: {
      title:       "Portré fotózás | OptikArt",
      description: "Pillantások – arcok, pillanatok, emlékek.",
      url:         `${BASE_URL}/portrait`,
      images:      [{ url: `${BASE_URL}/og/portrait.jpg`, width: 1200, height: 630, alt: "Portré fotózás" }],
    },
    alternates: { canonical: `${BASE_URL}/portrait` },
  }),

  event: buildMetadata({
    title:       "Rendezvényfotózás és -videózás | OptikArt",
    description: "Céges rendezvény, fesztivál, ballagás, party – professzionális rendezvényfotózás és videózás. Gyors átadás, profi minőség.",
    keywords:    ["rendezvényfotózás","rendezvény fotós","céges rendezvény fotózás","fesztivál fotózás","ballagás fotózás","event fotós"],
    openGraph: {
      title:       "Rendezvényfotózás | OptikArt",
      description: "Minden pillanat számít – megörökítjük az energiát.",
      url:         `${BASE_URL}/event`,
      images:      [{ url: `${BASE_URL}/og/event.jpg`, width: 1200, height: 630, alt: "Rendezvényfotózás" }],
    },
    alternates: { canonical: `${BASE_URL}/event` },
  }),

  drone: buildMetadata({
    title:       "Drón fotózás és videózás | OptikArt",
    description: "Engedéllyel rendelkező drón fotózás és videózás 6K felbontásban. Légifotók ingatlanhoz, rendezvényhez, esküvőhöz.",
    keywords:    ["drón fotózás","drón videózás","légifotó","drón fotós Kiskunfélegyháza","6K drón videó","ingatlan légifotó"],
    openGraph: {
      title:       "Drón fotózás | OptikArt",
      description: "A világ felülnézetből egészen más – 6K felbontásban.",
      url:         `${BASE_URL}/drone`,
      images:      [{ url: `${BASE_URL}/og/drone.jpg`, width: 1200, height: 630, alt: "Drón fotózás" }],
    },
    alternates: { canonical: `${BASE_URL}/drone` },
  }),

  marketing: buildMetadata({
    title:       "Marketing fotó és videó tartalom | OptikArt",
    description: "Professzionális marketing fotózás és videózás – Instagram, TikTok, Facebook tartalom, brand film, termékfotó.",
    keywords:    ["marketing fotózás","marketing videó","social media tartalom","Instagram fotós","TikTok videó","brand film","termékfotózás"],
    openGraph: {
      title:       "Marketing tartalom | OptikArt",
      description: "Content, ami megállít – Instagram, TikTok, brand film.",
      url:         `${BASE_URL}/marketing`,
      images:      [{ url: `${BASE_URL}/og/marketing.jpg`, width: 1200, height: 630, alt: "Marketing fotózás" }],
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
    description:"Esküvői fotózás és videózás, portré, rendezvény, marketing és drón.",
    url:        BASE_URL,
    logo:       `${BASE_URL}/logo.png`,
    telephone:  "+36-30-922-1702",
    email:      "business@optikart.hu",
    address: {
      "@type":           "PostalAddress",
      streetAddress:     "Kállai u. 5",
      addressLocality:   "Kiskunfélegyháza",
      postalCode:        "6100",
      addressCountry:    "HU",
    },
    geo: { "@type": "GeoCoordinates", latitude: 46.7103, longitude: 19.8481 },
    sameAs: [
      "https://www.facebook.com/profile.php?id=61559809194634",
      "https://www.instagram.com/optikart_hu",
    ],
    priceRange: "$$",
  },
  website: {
    "@context": "https://schema.org",
    "@type":    "WebSite",
    name:       SITE_NAME,
    url:        BASE_URL,
  },
  wedding:   { "@context": "https://schema.org", "@type": "Service", name: "Esküvői fotózás és videózás",   provider: { "@type": "LocalBusiness", name: "OptikArt", url: BASE_URL }, url: `${BASE_URL}/wedding` },
  portrait:  { "@context": "https://schema.org", "@type": "Service", name: "Portré fotózás",                provider: { "@type": "LocalBusiness", name: "OptikArt", url: BASE_URL }, url: `${BASE_URL}/portrait` },
  event:     { "@context": "https://schema.org", "@type": "Service", name: "Rendezvényfotózás",             provider: { "@type": "LocalBusiness", name: "OptikArt", url: BASE_URL }, url: `${BASE_URL}/event` },
  drone:     { "@context": "https://schema.org", "@type": "Service", name: "Drón fotózás és videózás",      provider: { "@type": "LocalBusiness", name: "OptikArt", url: BASE_URL }, url: `${BASE_URL}/drone` },
  marketing: { "@context": "https://schema.org", "@type": "Service", name: "Marketing fotó és videó",       provider: { "@type": "LocalBusiness", name: "OptikArt", url: BASE_URL }, url: `${BASE_URL}/marketing` },
};