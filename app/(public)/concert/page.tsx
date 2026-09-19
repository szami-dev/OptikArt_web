// app/(public)/concert/page.tsx
// Szerver komponens: NEM "use client" — itt fut a fájlrendszer-olvasás,
// build/request időben, hogy a kliens felé csak a kész fájlnevek menjenek le.
// Ez tartja gyorsnak az oldalt: nincs extra JS-bundle, nincs futásidejű
// mappalistázás a böngészőben.

import fs from "node:fs";
import path from "node:path";
import ConcertClient from "./DroneClient"; // Kliens komponens, a galéria rendereléséhez

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const GALLERY_DIR = path.join(process.cwd(), "public", "gallery", "concert");

function getGalleryFilenames(): string[] {
  try {
    return fs
      .readdirSync(GALLERY_DIR)
      .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } catch {
    // Ha a mappa build közben nem elérhető, üres galériával fut tovább
    // ahelyett, hogy elszállna a build.
    return [];
  }
}

export default function ConcertPage() {
  const filenames = getGalleryFilenames();
  return <ConcertClient filenames={filenames} />;
}