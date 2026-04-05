import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Képfájl kiterjesztések amiket keresünk
const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

export type GalleryImage = {
  src: string;
  category: string;
  filename: string;
  width: number;   // sharp-pal olvassuk server oldalon
  height: number;
};

export type GalleryResponse = {
  images: GalleryImage[];
  videos: GalleryVideo[];
};

export type GalleryVideo = {
  id: string;
  youtubeId?: string;
  videoSrc?: string;
  thumb: string;
  alt: string;
  category: string;
};

// ── Videók – ezeket kézzel töltöd ki ─────────────────────────
const VIDEOS: GalleryVideo[] = [
  
  {
    id: "v5",
    youtubeId: "dQw4w9WgXcQ",
    thumb: "/gallery/marketing/bts-9.JPG",
    alt: "Brand film – OptikArt",
    category: "marketing",
  },
];

const CATEGORIES = ["wedding", "event", "portrait", "marketing", "drone"];

export async function GET() {
  // sharp csak server oldalon elérhető
  // npm install sharp -- ha még nincs telepítve
  let sharp: any;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    sharp = null;
  }

  const images: GalleryImage[] = [];

  for (const category of CATEGORIES) {
    const folderPath = path.join(process.cwd(), "public", "gallery", category);
    if (!fs.existsSync(folderPath)) continue;

    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!IMAGE_EXTS.includes(ext)) continue;
      if (file.includes("-thumb")) continue;

      const filePath = path.join(folderPath, file);
      let width = 4;   // default aspect ratio fallback
      let height = 3;

      // Sharp-pal olvassuk a valós méretet – így a justified layout pontos lesz
      if (sharp) {
        try {
          const meta = await sharp(filePath).metadata();
          width = meta.width ?? 4;
          height = meta.height ?? 3;
        } catch {
          // Ha valamiért nem sikerül, marad a default
        }
      }

      images.push({
        src: `/gallery/${category}/${file}`,
        category,
        filename: file,
        width,
        height,
      });
    }
  }

  return NextResponse.json({ images, videos: VIDEOS } satisfies GalleryResponse);
}