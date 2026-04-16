"use client";

// app/(user)/user/gallery/[token]/page.tsx
// Dedikált galéria oldal – cover photo, letöltés, videó, Google Drive

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type GalleryImage = {
  id: number;
  thumbnailUrl: string;
  previewUrl: string;
  fileName: string | null;
  bytes: number | null;
};
type GalleryVideo = {
  id: number;
  thumbnailUrl: string | null;
  streamUrl: string;
  fileName: string | null;
  bytes: number | null;
  duration: number | null;
};
type GalleryData = {
  id: number;
  title: string | null;
  description: string | null;
  coverImageUrl: string | null;
  expiresAt: string | null;
  hasPassword: boolean;
  isPublic: boolean;
  googleDriveUrl: string | null;
  isExpired: boolean;
  project: { name: string | null; id: number };
  _count: { images: number };
};

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
function formatDuration(s: number) {
  const m = Math.floor(s / 60),
    sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function UserGalleryPage() {
  const { token } = useParams<{ token: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const [state, setState] = useState<
    "loading" | "locked" | "unlocked" | "expired" | "error"
  >("loading");
  const [gallery, setGallery] = useState<GalleryData | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [videoModal, setVideoModal] = useState<GalleryVideo | null>(null);
  const [downloading, setDownloading] = useState<number | "all" | null>(null);
  const [dlProgress, setDlProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [copied, setCopied] = useState(false);
  const [expiredData, setExpiredData] = useState<{
    driveUrl: string | null;
    projectName: string | null;
    title: string | null;
    expiresAt: string | null;
  }>({ driveUrl: null, projectName: null, title: null, expiresAt: null });

  const load = useCallback(
    async (pw?: string) => {
      const url = `/api/galleries/share/${token}${pw ? `?password=${encodeURIComponent(pw)}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.status === 410) {
        setExpiredData({
          driveUrl: data.googleDriveUrl ?? null,
          projectName: data.projectName ?? null,
          title: data.title ?? null,
          expiresAt: data.expiresAt ?? null,
        });
        setState("expired");
        return;
      }
      if (res.status === 404 || res.status === 403) {
        setState("error");
        return;
      }

      if (data.locked) {
        setGallery({
          id: 0,
          title: data.title,
          description: null,
          coverImageUrl: null,
          expiresAt: null,
          hasPassword: true,
          isPublic: true,
          googleDriveUrl: data.googleDriveUrl ?? null,
          isExpired: false,
          project: { name: data.projectName, id: 0 },
          _count: { images: data.imageCount },
        });
        setState("locked");
        if (pw) setPwError("Helytelen jelszó");
        return;
      }

      setGallery(data.gallery);
      setImages(data.images ?? []);
      setVideos(data.videos ?? []);
      setState("unlocked");
    },
    [token],
  );

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (session && state === "locked") load();
  }, [session]);

  async function handleUnlock() {
    if (!password.trim()) return;
    setUnlocking(true);
    setPwError("");
    await load(password);
    setUnlocking(false);
  }

  async function handleDownload(imageId?: number, videoId?: number) {
    if (!gallery?.id) return;
    setDownloading((imageId ?? videoId ?? "all") as any);
    try {
      const res = await fetch(`/api/galleries/${gallery.id}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId,
          videoId,
          password: password || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Letöltési hiba");

      if (imageId || videoId) {
        const a = document.createElement("a");
        a.href = data.url;
        a.download = data.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const urls: { url: string; fileName: string }[] = data.urls ?? [];
        setDlProgress({ done: 0, total: urls.length });
        for (let i = 0; i < urls.length; i++) {
          const a = document.createElement("a");
          a.href = urls[i].url;
          a.download = urls[i].fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setDlProgress({ done: i + 1, total: urls.length });
          await new Promise((r) => setTimeout(r, 500));
        }
        setDlProgress(null);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDownloading(null);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/gallery/${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Loading ────────────────────────────────────────────────
  if (state === "loading")
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
      </div>
    );

  // ── Lejárt ─────────────────────────────────────────────────
  if (state === "expired")
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 border border-[#EDE8E0] flex items-center justify-center mx-auto mb-6">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C8A882"
              strokeWidth="1.3"
              className="w-7 h-7"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          {expiredData.projectName && (
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-6 h-px bg-[#C8A882]/40" />
              <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">
                {expiredData.projectName}
              </span>
              <div className="w-6 h-px bg-[#C8A882]/40" />
            </div>
          )}
          <h1 className="font-['Cormorant_Garamond'] text-[2.2rem] font-light text-[#1A1510] mb-2">
            Ez a galéria lejárt
          </h1>
          <p className="text-[13px] text-[#A08060] mb-8 leading-relaxed">
            A megosztási link érvényességi ideje lejárt
            {expiredData.expiresAt &&
              ` (${new Date(expiredData.expiresAt).toLocaleDateString("hu-HU")})`}
            .
          </p>
          {expiredData.driveUrl ? (
            <div className="bg-white border border-[#EDE8E0] p-6 mb-4 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#FAF8F4] border border-[#EDE8E0] flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C8A882"
                    strokeWidth="1.3"
                    className="w-5 h-5"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[#1A1510]">
                    Az anyagok elérhetők Google Drive-on
                  </div>
                  <div className="text-[11px] text-[#A08060]">
                    Hosszú távú archívumon megőriztük
                  </div>
                </div>
              </div>
              <a
                href={expiredData.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#1A1510] text-white text-[11px] tracking-[0.14em] uppercase px-6 py-3 hover:bg-[#C8A882] transition-all"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Google Drive megnyitása
              </a>
            </div>
          ) : (
            <div className="bg-white border border-[#EDE8E0] p-6 mb-4 text-left">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-[#FDF9F5] border border-[#EDE8E0] flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C8A882"
                    strokeWidth="1.3"
                    className="w-5 h-5"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[#1A1510] mb-1">
                    Szükséged van az anyagokra?
                  </div>
                  <p className="text-[12px] text-[#7A6A58] leading-relaxed">
                    Vedd fel velünk a kapcsolatot és segítünk hozzáférni a
                    fájlokhoz.
                  </p>
                </div>
              </div>
              <a
                href="mailto:business@optikart.hu"
                className="flex items-center justify-center gap-2 w-full border border-[#1A1510] text-[#1A1510] text-[11px] tracking-[0.14em] uppercase px-6 py-3 hover:bg-[#1A1510] hover:text-white transition-all"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Kapcsolatfelvétel
              </a>
            </div>
          )}
          {gallery?.project?.id ? (
            <Link
              href={`/user/projects/${gallery.project.id}`}
              className="text-[11px] text-[#A08060] hover:text-[#C8A882] transition-colors"
            >
              ← Vissza a projekthez
            </Link>
          ) : null}
        </div>
      </div>
    );

  // ── Hiba ──────────────────────────────────────────────────
  if (state === "error")
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#1A1510] mb-2">
            Galéria nem található
          </h1>
          <p className="text-[13px] text-[#A08060] mb-6">
            A link érvénytelen vagy a galéria törölve lett.
          </p>
          <Link
            href="/user/projects"
            className="text-[11px] tracking-[0.1em] uppercase text-[#C8A882] border-b border-[#C8A882]/30 pb-0.5"
          >
            ← Vissza a projektekhez
          </Link>
        </div>
      </div>
    );

  // ── Jelszó képernyő ────────────────────────────────────────
  if (state === "locked")
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 border border-[#EDE8E0] flex items-center justify-center mx-auto mb-5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C8A882"
                strokeWidth="1.3"
                className="w-6 h-6"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-5 h-px bg-[#C8A882]/40" />
              <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">
                {gallery?.project.name ?? "Galéria"}
              </span>
              <div className="w-5 h-px bg-[#C8A882]/40" />
            </div>
            <h1 className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#1A1510] mb-1">
              {gallery?.title ?? "Jelszóvédett galéria"}
            </h1>
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              placeholder="Jelszó megadása..."
              className="w-full bg-white border border-[#EDE8E0] text-[13px] text-[#1A1510] placeholder:text-[#C8B8A0] px-4 py-3 focus:outline-none focus:border-[#C8A882] transition-colors"
              autoFocus
            />
            {pwError && <p className="text-[11px] text-red-500">{pwError}</p>}
            <button
              onClick={handleUnlock}
              disabled={unlocking || !password.trim()}
              className="py-3 bg-[#1A1510] text-[11px] tracking-[0.14em] uppercase text-white hover:bg-[#C8A882] transition-all disabled:opacity-50"
            >
              {unlocking ? "Ellenőrzés..." : "Megnyitás →"}
            </button>
          </div>
        </div>
      </div>
    );

  const totalItems = images.length + videos.length;

  // ── Galéria ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* Lightbox */}
      {lightbox !== null && images[lightbox] && (
        <div
          className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((i) => Math.max(0, (i ?? 0) - 1));
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((i) => Math.min(images.length - 1, (i ?? 0) + 1));
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div
            className="relative max-w-5xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightbox].previewUrl}
              alt=""
              className="max-h-[85vh] max-w-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-white/50 truncate">
                {images[lightbox].fileName}
              </span>
              <button
                onClick={() => handleDownload(images[lightbox].id)}
                className="shrink-0 flex items-center gap-1.5 text-[10px] uppercase text-white/60 hover:text-white transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-3.5 h-3.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Letöltés
              </button>
              <span className="text-[11px] text-white/30 shrink-0">
                {lightbox + 1} / {images.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Videó modal */}
      {videoModal && (
        <div
          className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center"
          onClick={() => setVideoModal(null)}
        >
          <button
            onClick={() => setVideoModal(null)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div
            className="w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={videoModal.streamUrl}
              controls
              autoPlay
              className="w-full max-h-[75vh] bg-black"
              style={{ outline: "none" }}
            />
            <div className="bg-black/80 px-4 py-2.5 flex items-center justify-between">
              <span className="text-[11px] text-white/60 truncate">
                {videoModal.fileName}
              </span>
              <button
                onClick={() => handleDownload(undefined, videoModal.id)}
                className="flex items-center gap-1.5 text-[10px] uppercase text-white/60 hover:text-white transition-colors ml-4 shrink-0"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-3.5 h-3.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Letöltés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cover hero ── */}
      {gallery?.coverImageUrl ? (
        <div
          className="relative w-full overflow-hidden"
          style={{ height: "clamp(280px,45vw,520px)" }}
        >
          <img
            src={gallery.coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(26,21,16,0.1) 0%, rgba(26,21,16,0.7) 100%)",
            }}
          />

          {/* Vissza gomb */}
          {gallery?.project?.id ? (
            <Link
              href={`/user/projects/${gallery.project.id}?tab=gallery`}
              className="absolute top-5 left-5 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[11px] tracking-[0.08em] uppercase"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-4 h-4"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Vissza
            </Link>
          ) : null}

          {/* Cím a cover alján */}
          <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 pb-8">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/70 mb-2 block">
                    {gallery?.project.name}
                  </span>
                  <h1 className="font-['Cormorant_Garamond'] text-[2.2rem] sm:text-[3rem] font-light text-white leading-tight">
                    {gallery?.title ?? "Galéria"}
                  </h1>
                  {gallery?.description && (
                    <p className="text-[13px] text-white/60 mt-1 max-w-lg">
                      {gallery.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {images.length > 0 && (
                    <div className="text-right">
                      <div className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#C8A882] leading-none">
                        {images.length}
                      </div>
                      <div className="text-[9px] tracking-[0.1em] uppercase text-white/40">
                        fotó
                      </div>
                    </div>
                  )}
                  {videos.length > 0 && (
                    <div className="text-right">
                      <div className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#C8A882] leading-none">
                        {videos.length}
                      </div>
                      <div className="text-[9px] tracking-[0.1em] uppercase text-white/40">
                        videó
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Fejléc cover nélkül ── */
        <div className="bg-white border-b border-[#EDE8E0] px-5 sm:px-8 lg:px-12 py-8">
          <div className="max-w-5xl mx-auto">
            {gallery?.project?.id ? (
              <Link
                href={`/user/projects/${gallery.project.id}?tab=gallery`}
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.08em] text-[#A08060] hover:text-[#1A1510] transition-colors mb-4"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-3.5 h-3.5"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Vissza a projekthez
              </Link>
            ) : null}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-5 h-px bg-[#C8A882]" />
                  <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">
                    {gallery?.project.name}
                  </span>
                </div>
                <h1 className="font-['Cormorant_Garamond'] text-[2rem] sm:text-[2.4rem] font-light text-[#1A1510] leading-tight">
                  {gallery?.title ?? "Galéria"}
                </h1>
                {gallery?.description && (
                  <p className="text-[13px] text-[#7A6A58] mt-2 max-w-lg">
                    {gallery.description}
                  </p>
                )}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#EDE8E0] flex-wrap">
                  {images.length > 0 && (
                    <div>
                      <div className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#C8A882] leading-none">
                        {images.length}
                      </div>
                      <div className="text-[9px] tracking-[0.12em] uppercase text-[#A08060]">
                        fénykép
                      </div>
                    </div>
                  )}
                  {videos.length > 0 && (
                    <div>
                      <div className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#C8A882] leading-none">
                        {videos.length}
                      </div>
                      <div className="text-[9px] tracking-[0.12em] uppercase text-[#A08060]">
                        videó
                      </div>
                    </div>
                  )}
                  {gallery?.expiresAt && !gallery.isExpired && (
                    <div>
                      <div className="text-[12px] text-[#1A1510]">
                        {new Date(gallery.expiresAt).toLocaleDateString(
                          "hu-HU",
                        )}
                      </div>
                      <div className="text-[9px] tracking-[0.12em] uppercase text-[#A08060]">
                        elérhető eddig
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Akció sáv ── */}
      <div
        className={`sticky top-0 z-20 border-b border-[#EDE8E0] bg-white/95 backdrop-blur-sm ${gallery?.coverImageUrl ? "" : ""}`}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Cover esetén vissza gomb */}
            {gallery?.coverImageUrl && gallery?.project?.id ? (
              <Link
                href={`/user/projects/${gallery.project.id}?tab=gallery`}
                className="flex items-center gap-1.5 text-[11px] tracking-[0.08em] text-[#A08060] hover:text-[#1A1510] transition-colors mr-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-3.5 h-3.5"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Vissza
              </Link>
            ) : null}

            {/* Tab */}
            {images.length > 0 && videos.length > 0 && (
              <div className="flex border border-[#EDE8E0]">
                <button
                  onClick={() => setActiveTab("photos")}
                  className={`px-3 py-1.5 text-[10px] tracking-[0.08em] uppercase border-r border-[#EDE8E0] transition-all ${activeTab === "photos" ? "bg-[#1A1510] text-white" : "text-[#A08060] hover:text-[#1A1510]"}`}
                >
                  Fotók
                </button>
                <button
                  onClick={() => setActiveTab("videos")}
                  className={`px-3 py-1.5 text-[10px] tracking-[0.08em] uppercase transition-all ${activeTab === "videos" ? "bg-[#1A1510] text-white" : "text-[#A08060] hover:text-[#1A1510]"}`}
                >
                  Videók
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Link másolás */}
            <button
              onClick={copyLink}
              className={`flex items-center gap-2 px-3 py-2 border text-[11px] uppercase transition-all ${
                copied
                  ? "border-green-400/50 text-green-600 bg-green-50"
                  : "border-[#EDE8E0] text-[#A08060] hover:border-[#C8A882]/50 hover:text-[#1A1510]"
              }`}
            >
              {copied ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-3.5 h-3.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Másolva!
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-3.5 h-3.5"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Link
                </>
              )}
            </button>

            {/* Összes letöltés */}
            <button
              onClick={() => handleDownload()}
              disabled={downloading === "all"}
              className="flex items-center gap-2 bg-[#1A1510] text-white text-[11px] uppercase px-4 py-2 hover:bg-[#C8A882] transition-all disabled:opacity-50"
            >
              {downloading === "all" ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
              {dlProgress
                ? `${dlProgress.done}/${dlProgress.total}`
                : "Összes letöltése"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Owner lejárt figyelmeztetés ── */}
      {gallery?.isExpired && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 sm:px-8 lg:px-12 py-3">
          <div className="max-w-5xl mx-auto text-[12px] text-amber-700 flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-4 h-4 shrink-0"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Ez a galéria lejárt – csak te látod tulajdonosként.
          </div>
        </div>
      )}

      {/* ── Tartalom ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* Fotók */}
        {(activeTab === "photos" || videos.length === 0) &&
          images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className="group relative bg-[#F0EBE3] overflow-hidden cursor-pointer"
                  style={{ aspectRatio: "4/3" }}
                  onClick={() => setLightbox(i)}
                >
                  <img
                    src={img.thumbnailUrl}
                    alt={img.fileName ?? ""}
                    loading="lazy"
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 flex items-end justify-between p-2.5">
                    <span className="text-[10px] text-white/80 truncate max-w-[70%]">
                      {img.fileName}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(img.id);
                      }}
                      disabled={downloading === img.id}
                      className="w-7 h-7 bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors shrink-0"
                    >
                      {downloading === img.id ? (
                        <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          className="w-3.5 h-3.5"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Videók */}
        {(activeTab === "videos" || images.length === 0) &&
          videos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((v) => (
                <div
                  key={v.id}
                  className="group relative bg-[#F0EBE3] overflow-hidden cursor-pointer"
                  style={{ aspectRatio: "16/9" }}
                  onClick={() => setVideoModal(v)}
                >
                  {v.thumbnailUrl ? (
                    <img
                      src={v.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-80"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#E8E0D8]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#C8A882"
                        strokeWidth="1"
                        className="w-12 h-12 opacity-40"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-black/60 transition-all">
                      <svg
                        viewBox="0 0 24 24"
                        fill="white"
                        className="w-5 h-5 ml-1"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 flex items-center justify-between">
                    <span className="text-[11px] text-white/80 truncate max-w-[60%]">
                      {v.fileName}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {v.duration && (
                        <span className="text-[10px] text-white/50">
                          {formatDuration(v.duration)}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(undefined, v.id);
                        }}
                        disabled={downloading === v.id}
                        className="w-6 h-6 bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors"
                      >
                        {downloading === v.id ? (
                          <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            className="w-3 h-3"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        {totalItems === 0 && (
          <div className="text-center py-16">
            <p className="text-[13px] text-[#A08060]">
              Még nincs anyag ebben a galériában.
            </p>
          </div>
        )}

        {/* Google Drive */}
        {gallery?.googleDriveUrl && !gallery.isExpired && (
          <div className="mt-10 border border-[#EDE8E0] bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#FAF8F4] border border-[#EDE8E0] flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C8A882"
                  strokeWidth="1.3"
                  className="w-5 h-5"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-['Cormorant_Garamond'] text-[1.2rem] font-light text-[#1A1510] mb-1">
                  Hosszú távú archiválás
                </h3>
                <p className="text-[12px] text-[#7A6A58] mb-4">
                  Az anyagokat Google Drive-on is megőriztük. A galéria lejárta
                  után is elérheted.
                </p>
                <a
                  href={gallery.googleDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1A1510] text-white text-[11px] uppercase px-5 py-2.5 hover:bg-[#C8A882] transition-all"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-4 h-4"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Google Drive megnyitása
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-[#EDE8E0] flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] text-[#C8B8A0]">OptikArt</span>
          {gallery?.expiresAt && !gallery.isExpired && (
            <span className="text-[11px] text-[#C8B8A0]">
              Elérhető:{" "}
              {new Date(gallery.expiresAt).toLocaleDateString("hu-HU")}-ig
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
