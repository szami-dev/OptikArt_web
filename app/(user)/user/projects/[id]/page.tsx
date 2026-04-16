"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

// ── Típusok ───────────────────────────────────────────────────
type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "OVERDUE" | "REFUNDED";
type Tab = "overview" | "messages" | "gallery" | "calendar";

type GalleryImage = {
  id: number;
  fileName: string | null;
  thumbnailUrl: string | null;
  previewUrl: string | null;
};

type GalleryVideo = {
  id: number;
  fileName: string | null;
  thumbnailUrl: string | null;
  streamUrl: string;
  bytes: number | null;
  duration: number | null;
};

type Gallery = {
  id: number;
  title: string | null;
  description: string | null;
  shareToken: string;
  shareableLink: string | null;
  expiresAt: string | null;
  isPublic: boolean;
  hasPassword: boolean;
  googleDriveUrl: string | null;
  images: GalleryImage[];
  videos: GalleryVideo[];
};

type Project = {
  id: number;
  name: string | null;
  description: string | null;
  status: ProjectStatus | null;
  paymentStatus: PaymentStatus | null;
  totalPrice: number | null;
  createdAt: string;
  eventDate: string | null;
  type: { name: string | null } | null;
  category: {
    name: string | null;
    bulletPoints: { id: number; title: string | null }[];
  } | null;
  calendarEvents: {
    id: number;
    title: string | null;
    startTime: string | null;
    endTime: string | null;
    wholeDay: boolean;
  }[];
  galleries: Gallery[];
  messages: {
    id: number;
    content: string | null;
    createdAt: string;
    sender: { id: number; name: string | null; role: string };
    receiver: { id: number; name: string | null; role: string };
  }[];
};

// ── Meta ──────────────────────────────────────────────────────
const STATUS_META: Record<
  ProjectStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  PLANNING: {
    label: "Tervezés",
    color: "#A08060",
    bg: "#FDF9F5",
    border: "#EDE8E0",
  },
  IN_PROGRESS: {
    label: "Folyamatban",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  COMPLETED: {
    label: "Elkészült",
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
  },
  ON_HOLD: {
    label: "Felfüggesztve",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  CANCELLED: {
    label: "Törölve",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
};
const PAYMENT_META: Record<
  PaymentStatus,
  { label: string; color: string; bg: string; border: string; desc: string }
> = {
  PENDING: {
    label: "Függőben",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    desc: "A fizetés még nem érkezett meg. Kérdés esetén írj nekünk üzenetet.",
  },
  PAID: {
    label: "Fizetve",
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    desc: "A fizetés sikeresen megérkezett. Köszönjük!",
  },
  OVERDUE: {
    label: "Lejárt",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    desc: "A fizetési határidő lejárt. Kérjük vedd fel velünk a kapcsolatot.",
  },
  REFUNDED: {
    label: "Visszatérítve",
    color: "#7C3AED",
    bg: "#EEF2FF",
    border: "#C7D2FE",
    desc: "Az összeg visszatérítésre került.",
  },
};
const STATUS_STEPS: ProjectStatus[] = ["PLANNING", "IN_PROGRESS", "COMPLETED"];
const HU_MONTHS = [
  "január",
  "február",
  "március",
  "április",
  "május",
  "június",
  "július",
  "augusztus",
  "szeptember",
  "október",
  "november",
  "december",
];
const HU_MONTHS_SH = [
  "jan",
  "feb",
  "már",
  "ápr",
  "máj",
  "jún",
  "júl",
  "aug",
  "szep",
  "okt",
  "nov",
  "dec",
];
const HU_DAYS = [
  "vasárnap",
  "hétfő",
  "kedd",
  "szerda",
  "csütörtök",
  "péntek",
  "szombat",
];

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

// ── StatusProgress – változatlan ──────────────────────────────
function StatusProgress({ status }: { status: ProjectStatus | null }) {
  if (!status || status === "CANCELLED" || status === "ON_HOLD") return null;
  const idx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center">
      {STATUS_STEPS.map((s, i) => {
        const done = i <= idx;
        const m = STATUS_META[s];
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className="w-6 h-6 flex items-center justify-center border text-[10px] transition-all"
                style={
                  done
                    ? { borderColor: m.color, background: m.bg, color: m.color }
                    : { borderColor: "#EDE8E0", color: "#C8B8A0" }
                }
              >
                {done ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="w-3 h-3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className="text-[9px] tracking-[0.08em] whitespace-nowrap"
                style={done ? { color: m.color } : { color: "#C8B8A0" }}
              >
                {m.label}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className="flex-1 h-px mx-2 mb-4"
                style={{
                  background: i < idx ? "rgba(200,168,130,0.3)" : "#EDE8E0",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── EventDateHero – változatlan ───────────────────────────────
function EventDateHero({
  eventDate,
  calendarEvents,
}: {
  eventDate: string | null;
  calendarEvents: Project["calendarEvents"];
}) {
  const now = new Date();
  const primary = eventDate ? new Date(eventDate) : null;
  const daysUntilPrimary = primary
    ? Math.ceil((primary.getTime() - now.getTime()) / 86400000)
    : null;
  const isPrimaryPast = daysUntilPrimary !== null && daysUntilPrimary < 0;
  const isPrimaryToday = daysUntilPrimary === 0;
  const extraEvents = (calendarEvents ?? [])
    .filter((e) => e.startTime)
    .sort(
      (a, b) =>
        new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime(),
    );
  if (!primary && extraEvents.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {primary && (
        <div className="bg-[#1A1510] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(#C8A882 1px,transparent 1px),linear-gradient(90deg,#C8A882 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 p-5 sm:p-7">
            <div className="flex items-center gap-5">
              <div className="flex flex-col items-center border border-[#C8A882]/25 px-5 py-3 min-w-[76px] shrink-0">
                <span className="text-[9px] tracking-[0.18em] uppercase text-[#C8A882]/50">
                  {primary.getFullYear()}
                </span>
                <span className="font-['Cormorant_Garamond'] text-[4rem] font-light text-white leading-none">
                  {primary.getDate()}
                </span>
                <span className="text-[11px] tracking-[0.08em] uppercase text-[#C8A882]">
                  {HU_MONTHS[primary.getMonth()]}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] tracking-[0.18em] uppercase text-[#C8A882]/30 border border-[#C8A882]/20 px-1.5 py-0.5 self-start">
                  ✦ Fotózás napja
                </span>
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8A882]/40">
                  {HU_DAYS[primary.getDay()]}
                </span>
                <span className="font-['Cormorant_Garamond'] text-[1.3rem] font-light text-white leading-tight">
                  {primary.toLocaleDateString("hu-HU", {
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="sm:ml-auto shrink-0 sm:text-right">
              {isPrimaryToday ? (
                <div className="inline-flex items-center gap-2 border border-green-500/30 bg-green-500/10 px-4 py-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[12px] tracking-[0.1em] uppercase text-green-400 font-medium">
                    Ma van!
                  </span>
                </div>
              ) : isPrimaryPast ? (
                <div>
                  <div className="text-[10px] tracking-[0.12em] uppercase text-white/25 mb-0.5">
                    Lezajlott
                  </div>
                  <div className="font-['Cormorant_Garamond'] text-[1.8rem] font-light text-white/30 leading-none">
                    {Math.abs(daysUntilPrimary!)} napja
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-[9px] tracking-[0.15em] uppercase text-[#C8A882]/40 mb-0.5">
                    Visszaszámláló
                  </div>
                  <div className="font-['Cormorant_Garamond'] text-[3.5rem] sm:text-[4rem] font-light text-[#C8A882] leading-none">
                    {daysUntilPrimary}
                  </div>
                  <div className="text-[10px] tracking-[0.12em] uppercase text-[#C8A882]/50">
                    nap múlva
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// GALÉRIA KOMPONENS – teljes újraírás
// ════════════════════════════════════════════════════════════════
function GalleryTab({
  gallery,
  projectId,
}: {
  gallery: Gallery;
  projectId: number;
}) {
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [videoModal, setVideoModal] = useState<GalleryVideo | null>(null);
  const [downloading, setDownloading] = useState<number | "all" | null>(null);
  const [copied, setCopied] = useState(false);
  const [dlProgress, setDlProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

  const images = gallery.images;
  const videos = gallery.videos ?? [];
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/gallery/${gallery.shareToken}`;

  // ── Letöltés ────────────────────────────────────────────────
  async function handleDownload(imageId?: number, videoId?: number) {
    const key = imageId ?? videoId ?? "all";
    setDownloading(key as any);
    try {
      const res = await fetch(`/api/galleries/${gallery.id}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, videoId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Letöltési hiba");

      if (imageId || videoId) {
        // Egyszeres
        const a = document.createElement("a");
        a.href = data.url;
        a.download = data.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Összes – sorban
        const urls: { url: string; fileName: string }[] = data.urls ?? [];
        setDlProgress({ done: 0, total: urls.length });
        for (let i = 0; i < urls.length; i++) {
          const item = urls[i];
          const a = document.createElement("a");
          a.href = item.url;
          a.download = item.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setDlProgress({ done: i + 1, total: urls.length });
          await new Promise((r) => setTimeout(r, 600)); // böngésző letöltés queue
        }
        setDlProgress(null);
      }
    } catch (e: any) {
      alert(e.message ?? "Letöltési hiba");
    } finally {
      setDownloading(null);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-0 bg-white border border-[#EDE8E0] overflow-hidden">
      {/* ── Fejléc ── */}
      <div className="px-6 py-5 border-b border-[#EDE8E0] bg-[#FAF8F4]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-4 h-px bg-[#C8A882]" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]">
                Átadott anyag
              </span>
            </div>
            <h3 className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#1A1510] leading-none mb-1">
              {gallery.title ?? "Galéria"}
            </h3>
            <div className="flex items-center gap-3 text-[11px] text-[#A08060] flex-wrap">
              {images.length > 0 && <span>{images.length} fotó</span>}
              {videos.length > 0 && (
                <>
                  <span>·</span>
                  <span>{videos.length} videó</span>
                </>
              )}
              {gallery.expiresAt && (
                <>
                  <span>·</span>
                  <span className="text-[#DC2626]">
                    Elérhető:{" "}
                    {new Date(gallery.expiresAt).toLocaleDateString("hu-HU")}-ig
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Gombok */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Share link másolás */}
            <button
              onClick={copyLink}
              className={`flex items-center gap-2 px-4 py-2 border text-[11px] tracking-[0.08em] uppercase transition-all ${
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
                  Galéria link
                </>
              )}
            </button>

            {/* Összes letöltés */}
            <button
              onClick={() => handleDownload()}
              disabled={downloading === "all"}
              className="flex items-center gap-2 bg-[#1A1510] text-white text-[11px] tracking-[0.1em] uppercase px-4 py-2 hover:bg-[#C8A882] transition-all disabled:opacity-60"
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

        {/* Tab navigáció ha van fotó és videó is */}
        {images.length > 0 && videos.length > 0 && (
          <div className="flex gap-0 mt-5 -mb-5 border-t border-[#EDE8E0] pt-4">
            <button
              onClick={() => setActiveTab("photos")}
              className={`px-4 py-2 text-[11px] tracking-[0.08em] uppercase border-b-2 transition-all ${activeTab === "photos" ? "border-[#C8A882] text-[#1A1510]" : "border-transparent text-[#A08060] hover:text-[#1A1510]"}`}
            >
              Fotók ({images.length})
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-4 py-2 text-[11px] tracking-[0.08em] uppercase border-b-2 transition-all ${activeTab === "videos" ? "border-[#C8A882] text-[#1A1510]" : "border-transparent text-[#A08060] hover:text-[#1A1510]"}`}
            >
              Videók ({videos.length})
            </button>
          </div>
        )}
      </div>

      {/* ── Fotók grid ── */}
      {(activeTab === "photos" || videos.length === 0) && images.length > 0 && (
        <>
          {/* Lightbox */}
          {lightbox !== null && images[lightbox] && (
            <div
              className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-4"
              onClick={() => setLightbox(null)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) => Math.max(0, (i ?? 0) - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-6 h-6"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) => Math.min(images.length - 1, (i ?? 0) + 1));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-6 h-6"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-6 h-6"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div
                className="relative max-w-5xl max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={
                    images[lightbox].previewUrl ??
                    images[lightbox].thumbnailUrl ??
                    ""
                  }
                  alt=""
                  className="max-h-[85vh] max-w-full object-contain shadow-2xl"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-2.5 flex items-center justify-between gap-4">
                  <span className="text-[11px] text-white/50 truncate">
                    {images[lightbox].fileName}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleDownload(images[lightbox].id)}
                      disabled={downloading === images[lightbox].id}
                      className="flex items-center gap-1.5 text-[10px] tracking-[0.1em] uppercase text-white/60 hover:text-white transition-colors"
                    >
                      {downloading === images[lightbox].id ? (
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
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
                      )}
                      Letöltés
                    </button>
                    <span className="text-[11px] text-white/30">
                      {lightbox + 1} / {images.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className="group relative aspect-[4/3] bg-[#F0EBE3] overflow-hidden cursor-pointer"
                  onClick={() => setLightbox(i)}
                >
                  {img.thumbnailUrl && (
                    <img
                      src={img.thumbnailUrl}
                      alt={img.fileName ?? ""}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                    <span className="text-[9px] text-white/70 truncate max-w-[70%]">
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
          </div>
        </>
      )}

      {/* ── Videók grid ── */}
      {(activeTab === "videos" || images.length === 0) && videos.length > 0 && (
        <>
          {/* Videó modal */}
          {videoModal && (
            <div
              className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-4"
              onClick={() => setVideoModal(null)}
            >
              <button
                onClick={() => setVideoModal(null)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-6 h-6"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div
                className="w-full max-w-4xl"
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
                    disabled={downloading === videoModal.id}
                    className="flex items-center gap-1.5 text-[10px] tracking-[0.1em] uppercase text-white/60 hover:text-white transition-colors ml-4 shrink-0"
                  >
                    {downloading === videoModal.id ? (
                      <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
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
                    )}
                    Letöltés
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

                  {/* Play gomb */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-black/60 group-hover:scale-110 transition-all">
                      <svg
                        viewBox="0 0 24 24"
                        fill="white"
                        className="w-5 h-5 ml-1"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>

                  {/* Info bar */}
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
                        className="w-7 h-7 bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors"
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
          </div>
        </>
      )}

      {/* Google Drive szekció */}
      {gallery.googleDriveUrl && (
        <div className="border-t border-[#EDE8E0] px-6 py-5 bg-[#FAF8F4] flex items-start gap-4">
          <div className="w-9 h-9 bg-white border border-[#EDE8E0] flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C8A882"
              strokeWidth="1.3"
              className="w-4 h-4"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-[12px] font-medium text-[#1A1510] mb-0.5">
              Hosszú távú archiválás
            </div>
            <p className="text-[11px] text-[#7A6A58] mb-3">
              Az anyagok a galéria lejárta után is elérhetők Google Drive-on
              keresztül.
            </p>
            <a
              href={gallery.googleDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase text-[#1A1510] border border-[#EDE8E0] px-4 py-2 hover:border-[#C8A882]/50 hover:text-[#C8A882] transition-all"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-3.5 h-3.5"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Google Drive megnyitása
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// FŐ OLDAL KOMPONENS
// ════════════════════════════════════════════════════════════════
export default function UserProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [msgContent, setMsgContent] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgError, setMsgError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const myId = parseInt((session?.user?.id as string) ?? "0");

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}/user`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error();
      setProject((await res.json()).project);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);
  useEffect(() => {
    if (tab === "messages")
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        80,
      );
  }, [tab, project?.messages?.length]);

  async function sendMessage() {
    if (!msgContent.trim()) return;
    setMsgError("");
    setSendingMsg(true);
    try {
      const adminRes = await fetch("/api/user/getusers");
      const adminData = await adminRes.json();
      const admin = adminData.users?.find(
        (u: any) => u.role === "ADMIN" && u.id !== myId,
      );
      if (!admin) throw new Error("Nem található adminisztrátor");
      const res = await fetch(`/api/projects/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: msgContent.trim(),
          receiverId: admin.id,
        }),
      });
      if (!res.ok) throw new Error();
      setMsgContent("");
      await fetchProject();
    } catch (e: any) {
      setMsgError(e.message ?? "Hiba az üzenet küldésekor");
    } finally {
      setSendingMsg(false);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
      </div>
    );

  if (notFound || !project)
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#1A1510] mb-3">
            Projekt nem található
          </h2>
          <p className="text-[13px] text-[#A08060] mb-6">
            Lehet hogy töröltük, vagy nem rendelkezel hozzáféréssel.
          </p>
          <Link
            href="/user/projects"
            className="text-[11px] tracking-[0.12em] uppercase text-[#C8A882] border-b border-[#C8A882]/30 pb-0.5"
          >
            ← Vissza
          </Link>
        </div>
      </div>
    );

  const status = project.status ?? "PLANNING";
  const sm = STATUS_META[status];
  const ps = project.paymentStatus;
  const pm = ps ? PAYMENT_META[ps] : null;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Áttekintés" },
    { key: "messages", label: "Üzenetek", count: project.messages.length },
    { key: "gallery", label: "Galéria", count: project.galleries.length },
    { key: "calendar", label: "Naptár", count: project.calendarEvents.length },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* Fejléc */}
      <div className="bg-white border-b border-[#EDE8E0] px-5 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="py-5 sm:py-6">
            <Link
              href="/user/projects"
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.08em] text-[#A08060] hover:text-[#1A1510] transition-colors mb-3"
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
              Projektek
            </Link>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <h1 className="font-['Cormorant_Garamond'] text-[1.6rem] sm:text-[2rem] font-light text-[#1A1510] leading-tight mb-1 truncate">
                  {project.name ?? "Névtelen projekt"}
                </h1>
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-[#A08060]">
                  <span>#{project.id}</span>
                  {project.type?.name && (
                    <>
                      <span>·</span>
                      <span>{project.type.name}</span>
                    </>
                  )}
                  <span>·</span>
                  <span>
                    {new Date(project.createdAt).toLocaleDateString("hu-HU")}
                  </span>
                  {project.eventDate && (
                    <>
                      <span>·</span>
                      <span className="text-[#C8A882]">
                        ✦{" "}
                        {new Date(project.eventDate).toLocaleDateString(
                          "hu-HU",
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <span
                  className="text-[10px] tracking-[0.08em] px-3 py-1.5 border font-medium"
                  style={{
                    color: sm.color,
                    background: sm.bg,
                    borderColor: sm.border,
                  }}
                >
                  {sm.label}
                </span>
                {pm && (
                  <span
                    className="text-[10px] tracking-[0.08em] px-3 py-1.5 border font-medium"
                    style={{
                      color: pm.color,
                      background: pm.bg,
                      borderColor: pm.border,
                    }}
                  >
                    {pm.label}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-0 overflow-x-auto scrollbar-none -mb-px">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-[11px] tracking-[0.08em] uppercase border-b-2 transition-all whitespace-nowrap ${tab === t.key ? "border-[#C8A882] text-[#1A1510]" : "border-transparent text-[#A08060] hover:text-[#1A1510]"}`}
              >
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-[#C8A882]/15 text-[#C8A882]" : "bg-[#EDE8E0] text-[#A08060]"}`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tartalom */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* ── Áttekintés – változatlan struktúra ── */}
        {tab === "overview" && (
          <div className="flex flex-col gap-5">
            <EventDateHero
              eventDate={project.eventDate}
              calendarEvents={project.calendarEvents}
            />

            {status !== "CANCELLED" && status !== "ON_HOLD" && (
              <div className="bg-white border border-[#EDE8E0] p-5 sm:p-6">
                <div className="text-[10px] tracking-[0.16em] uppercase text-[#A08060] mb-5">
                  Projekt állapota
                </div>
                <StatusProgress status={project.status} />
              </div>
            )}

            {(project.totalPrice != null || pm) && (
              <div
                className="bg-white border p-5 sm:p-6"
                style={{ borderColor: pm ? pm.border : "#EDE8E0" }}
              >
                <div className="text-[10px] tracking-[0.16em] uppercase text-[#A08060] mb-4">
                  Fizetési információk
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  {project.totalPrice != null && (
                    <div className="flex-1">
                      <div className="text-[9px] tracking-[0.14em] uppercase text-[#C8B8A0] mb-1.5">
                        Fizetendő összeg
                      </div>
                      <div className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#1A1510] leading-none">
                        {project.totalPrice.toLocaleString("hu-HU")} Ft
                      </div>
                    </div>
                  )}
                  {pm && (
                    <div className="flex-1">
                      <div className="text-[9px] tracking-[0.14em] uppercase text-[#C8B8A0] mb-2">
                        Fizetési státusz
                      </div>
                      <span
                        className="inline-flex items-center gap-2 text-[11px] px-3 py-1.5 border font-medium mb-3"
                        style={{
                          color: pm.color,
                          background: pm.bg,
                          borderColor: pm.border,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: pm.color }}
                        />
                        {pm.label}
                      </span>
                      <p className="text-[12px] text-[#7A6A58] leading-relaxed">
                        {pm.desc}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-[#EDE8E0] p-5">
                <div className="text-[10px] tracking-[0.16em] uppercase text-[#A08060] mb-4">
                  Projekt adatok
                </div>
                <div className="flex flex-col gap-4">
                  {[
                    { l: "Típus", v: project.type?.name ?? "—" },
                    { l: "Csomag", v: project.category?.name ?? "—" },
                    {
                      l: "Létrehozva",
                      v: new Date(project.createdAt).toLocaleDateString(
                        "hu-HU",
                      ),
                    },
                  ].map((row) => (
                    <div key={row.l}>
                      <div className="text-[9px] tracking-[0.14em] uppercase text-[#C8B8A0] mb-0.5">
                        {row.l}
                      </div>
                      <div className="text-[13px] text-[#1A1510]">{row.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-[#EDE8E0] p-5">
                <div className="text-[10px] tracking-[0.16em] uppercase text-[#A08060] mb-4">
                  Leírás
                </div>
                <p className="text-[13px] text-[#7A6A58] leading-relaxed whitespace-pre-wrap">
                  {project.description ?? "Nincs leírás"}
                </p>
              </div>
            </div>

            <div className="bg-[#F5EFE6] border border-[#EDE8E0] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="text-[11px] font-medium text-[#1A1510] mb-1">
                  Kérdésed van?
                </div>
                <p className="text-[12px] text-[#7A6A58]">
                  Írj nekünk az üzenetek fülön, és 24 órán belül válaszolunk.
                </p>
              </div>
              <button
                onClick={() => setTab("messages")}
                className="shrink-0 flex items-center gap-2 bg-[#1A1510] text-white text-[11px] tracking-[0.12em] uppercase px-5 py-2.5 hover:bg-[#C8A882] transition-all whitespace-nowrap"
              >
                Üzenet írása
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-3.5 h-3.5"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Üzenetek – változatlan ── */}
        {tab === "messages" && (
          <div className="flex flex-col gap-4" style={{ maxWidth: "640px" }}>
            <div
              className="bg-white border border-[#EDE8E0] flex flex-col overflow-hidden"
              style={{ minHeight: "360px", maxHeight: "520px" }}
            >
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                {project.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#EDE8E0"
                      strokeWidth="1.2"
                      className="w-8 h-8"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="text-[12px] text-[#C8B8A0]">
                      Még nincs üzenet
                    </span>
                  </div>
                ) : (
                  project.messages.map((msg) => {
                    const isMe = msg.sender.id === myId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}
                      >
                        {!isMe && (
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-5 h-5 bg-[#1A1510] flex items-center justify-center">
                              <span className="text-[8px] text-white font-medium">
                                {msg.sender.name?.charAt(0).toUpperCase() ??
                                  "A"}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#A08060] font-medium">
                              {msg.sender.name}
                            </span>
                            <span className="text-[9px] text-[#C8B8A0]">
                              · OptikArt csapat
                            </span>
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] px-4 py-3 text-[13px] leading-relaxed ${isMe ? "bg-[#1A1510] text-white" : "bg-[#FAF8F4] border border-[#EDE8E0] text-[#1A1510]"}`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-[#C8B8A0]">
                          {new Date(msg.createdAt).toLocaleString("hu-HU", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-[#EDE8E0] p-4 flex gap-3">
                <input
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Írj üzenetet..."
                  className="flex-1 bg-[#FAF8F4] border border-[#EDE8E0] text-[13px] text-[#1A1510] placeholder:text-[#C8B8A0] px-3 py-2.5 focus:outline-none focus:border-[#C8A882]/50 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={sendingMsg || !msgContent.trim()}
                  className="px-5 py-2.5 bg-[#1A1510] text-[11px] tracking-[0.1em] uppercase text-white hover:bg-[#C8A882] transition-all disabled:opacity-40"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-4 h-4"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
            {msgError && <p className="text-[11px] text-red-500">{msgError}</p>}
          </div>
        )}

        {/* ── Galéria – új komponens ── */}
        {tab === "gallery" && (
          <div className="flex flex-col gap-4">
            {project.galleries.length === 0 ? (
              <div className="bg-white border border-[#EDE8E0] p-16 text-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#EDE8E0"
                  strokeWidth="1.2"
                  className="w-12 h-12 mx-auto mb-4"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="font-['Cormorant_Garamond'] text-[1.5rem] text-[#1A1510] mb-1">
                  Még nincs galéria
                </p>
                <p className="text-[12px] text-[#A08060]">
                  A kész anyagokat ide töltjük majd fel.
                </p>
              </div>
            ) : (
              project.galleries.map((gallery) => (
                <GalleryTab
                  key={gallery.id}
                  gallery={gallery}
                  projectId={project.id}
                />
              ))
            )}
          </div>
        )}

        {/* ── Naptár – változatlan ── */}
        {tab === "calendar" && (
          <div className="flex flex-col gap-3">
            {project.calendarEvents.length === 0 ? (
              <div className="bg-white border border-[#EDE8E0] p-12 text-center">
                <p className="text-[13px] text-[#A08060]">
                  Még nincs ütemezett esemény
                </p>
              </div>
            ) : (
              project.calendarEvents.map((ev) => {
                const start = ev.startTime ? new Date(ev.startTime) : null;
                return (
                  <div
                    key={ev.id}
                    className="bg-white border border-[#EDE8E0] p-4 sm:p-5 flex items-start gap-4"
                  >
                    {start && (
                      <div className="shrink-0 w-12 text-center border border-[#EDE8E0] py-1.5">
                        <div className="text-[9px] tracking-[0.1em] uppercase text-[#A08060]">
                          {start.toLocaleDateString("hu-HU", {
                            month: "short",
                          })}
                        </div>
                        <div className="font-['Cormorant_Garamond'] text-[1.4rem] font-light text-[#1A1510] leading-none">
                          {start.getDate()}
                        </div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[#1A1510] mb-0.5">
                        {ev.title ?? "Névtelen esemény"}
                      </div>
                      <div className="text-[11px] text-[#A08060]">
                        {ev.wholeDay
                          ? "Egész napos esemény"
                          : [
                              start &&
                                start.toLocaleTimeString("hu-HU", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }),
                              ev.endTime &&
                                `– ${new Date(ev.endTime).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}`,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
