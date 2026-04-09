// app/lib/cloudinary.ts
// Szerver oldali Cloudinary helper – signed URL, delete, download

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:     process.env.CLOUDINARY_API_KEY!,
  api_secret:  process.env.CLOUDINARY_API_SECRET!,
  secure:      true,
});

export default cloudinary;

// ── URL builder helpers ───────────────────────────────────────

export function buildThumbnailUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    width:   400,
    height:  400,
    crop:    "fill",
    quality: "auto",
    format:  "auto",
    // Cache: 1 év CDN oldalon
    sign_url: false,
  });
}

export function buildPreviewUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    width:   1200,
    height:  900,
    crop:    "limit",
    quality: "auto",
    format:  "auto",
  });
}

export function buildOriginalUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    quality:   "auto",
    format:    "auto",
    flags:     "attachment", // letöltésre kényszeríti
  });
}

// ── Signed download URL (időkorláttal, letöltéshez) ──────────
// Vercel nem érinti – a böngésző közvetlenül Cloudinary-hoz megy
export function buildSignedDownloadUrl(
  publicId: string,
  originalFileName: string,
  expiresInSeconds = 3600
): string {
  const timestamp = Math.round(Date.now() / 1000) + expiresInSeconds;

  return cloudinary.url(publicId, {
    sign_url:   true,
    type:       "authenticated",
    // attachment = le kell tölteni, nem megjeleníteni
    flags:      `attachment:${encodeURIComponent(originalFileName)}`,
    expires_at: timestamp,
    resource_type: "image",
  });
}

// ── Kép törlése Cloudinary-ról ────────────────────────────────
export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

// ── Több kép törlése egyszerre ────────────────────────────────
export async function deleteCloudinaryImages(publicIds: string[]): Promise<void> {
  if (publicIds.length === 0) return;
  await cloudinary.api.delete_resources(publicIds, { resource_type: "image" });
}
