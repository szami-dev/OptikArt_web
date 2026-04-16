// lib/cloudinary.ts

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure:     true,
});

export default cloudinary;

function sanitizeFileName(raw: string): string {
  return raw.trim().replace(/[^\w.\-]/g, "_").replace(/_{2,}/g, "_");
}

export function buildThumbnailUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    width: 400, height: 400, crop: "fill",
    quality: "auto", format: "jpg",
  });
}

export function buildPreviewUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    width: 1200, height: 900, crop: "limit",
    quality: "auto", format: "jpg",
  });
}

// ── Kép signed download URL ───────────────────────────────────
export function buildSignedDownloadUrl(
  publicId:         string,
  originalFileName: string,
  expiresInSeconds  = 3600,
): string {
  const timestamp = Math.round(Date.now() / 1000) + expiresInSeconds;
  const safeName  = sanitizeFileName(originalFileName);

  return cloudinary.url(publicId, {
    sign_url:      true,
    type:          "upload",
    resource_type: "image",
    flags:         `attachment:${safeName}`,
    expires_at:    timestamp,
  });
}

// ── Videó signed download URL ─────────────────────────────────
// JAVÍTÁS: format explicit megadása hogy a Cloudinary
// a helyes kiterjesztéssel szolgálja ki a fájlt
export function buildSignedVideoDownloadUrl(
  publicId:         string,
  originalFileName: string,
  expiresInSeconds  = 3600,
  format            = "mp4",   // ← explicit format
): string {
  const timestamp = Math.round(Date.now() / 1000) + expiresInSeconds;
  const safeName  = sanitizeFileName(originalFileName);

  return cloudinary.url(publicId, {
    sign_url:      true,
    type:          "upload",
    resource_type: "video",
    format,                    // ← mp4 / mov stb.
    flags:         `attachment:${safeName}`,
    expires_at:    timestamp,
  });
}

export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
export async function deleteCloudinaryImages(publicIds: string[]): Promise<void> {
  if (!publicIds.length) return;
  await cloudinary.api.delete_resources(publicIds, { resource_type: "image" });
}
export async function deleteCloudinaryVideo(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
}
export async function deleteCloudinaryVideos(publicIds: string[]): Promise<void> {
  if (!publicIds.length) return;
  await cloudinary.api.delete_resources(publicIds, { resource_type: "video" });
}