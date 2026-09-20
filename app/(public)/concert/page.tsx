// app/(public)/concert/page.tsx
// Szerver komponens: NEM "use client" — itt fut a fájlrendszer-olvasás és a
// képméret-meghatározás build/request időben, hogy a kliens felé már kész
// (fájlnév + eredeti szélesség/magasság) adat menjen le. Ez kell a justified
// galéria elrendezéshez, és így sem fut le mappalistázás a böngészőben.
//
// Függőség: `npm install image-size` (a valós kép-dimenziók kiolvasásához).

import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
import ConcertClient, { type GalleryImageMeta } from "./ConcertClient";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const GALLERY_DIR = path.join(process.cwd(), "public", "gallery", "concert");

// Ha a méret valamiért nem olvasható ki, ezzel az aránnyal esünk vissza
// (kb. 3:2, tipikus fotó-arány) — így a layout akkor sem törik el.
const FALLBACK_WIDTH = 1600;
const FALLBACK_HEIGHT = 1067;

function getGalleryImages(): GalleryImageMeta[] {
  let filenames: string[];
  try {
    filenames = fs
      .readdirSync(GALLERY_DIR)
      .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch {
    // A mappa build közben nem elérhető — üres galériával futunk tovább
    // ahelyett, hogy elszállna a build.
    return [];
  }

  return filenames.map((filename) => {
    try {
      const buffer = fs.readFileSync(path.join(GALLERY_DIR, filename));
      const { width, height } = imageSize(buffer);
      return { filename, width: width ?? FALLBACK_WIDTH, height: height ?? FALLBACK_HEIGHT };
    } catch {
      return { filename, width: FALLBACK_WIDTH, height: FALLBACK_HEIGHT };
    }
  });
}

export default function ConcertPage() {
  const images = getGalleryImages();
  return <ConcertClient images={images} />;
}