"use client";

// app/(public)/gallery/[token]/page.tsx

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

type GalleryImage = {
  id: number;
  thumbnailUrl: string;
  previewUrl: string;
  fileName: string | null;
  bytes: number | null;
  width: number | null;
  height: number | null;
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

type ZipPhase =
  | { phase: "idle" }
  | { phase: "fetching-urls" }
  | { phase: "downloading"; done: number; total: number; currentFile: string }
  | { phase: "zipping"; done: number; total: number }
  | { phase: "saving" }
  | { phase: "done" }
  | { phase: "error"; message: string };

// Single videó letöltés progress
type VideoDownloadState =
  | { phase: "idle" }
  | { phase: "preparing" }
  | { phase: "downloading"; percent: number; fileName: string }
  | { phase: "done" }
  | { phase: "error"; message: string };

function formatDuration(s: number) {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function upgradeToCoverUrl(url: string): string {
  if (!url) return url;
  return url.replace(/\/upload\/[^/]+\//, "/upload/w_2400,q_auto,f_auto/");
}

function getFileNameWithExt(fileName: string, url: string): string {
  if (/\.\w{2,5}$/.test(fileName)) return fileName;
  const urlMatch = url.match(/\.(\w{2,5})(?:\?|$)/);
  const ext = urlMatch ? `.${urlMatch[1].toLowerCase()}` : ".jpg";
  return `${fileName}${ext}`;
}

function parseHeroTitle(title: string | null): { names: string; date: string | null } {
  if (!title) return { names: "", date: null };
  const parts = title.split("|");
  if (parts.length === 2) return { names: parts[0].trim(), date: parts[1].trim() };
  return { names: title, date: null };
}

function formatHeroDate(d: string): string {
  const clean = d.replace(/\.$/, "");
  const parts = clean.split(".");
  if (parts.length === 3) {
    const dt = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
    if (!isNaN(dt.getTime())) {
      return dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase();
    }
  }
  return d;
}

// ── ZIP Progress Overlay ──────────────────────────────────────
function ZipProgressOverlay({ state, onClose }: { state: ZipPhase; onClose: () => void }) {
  if (state.phase === "idle") return null;

  const percent =
    state.phase === "downloading" ? Math.round((state.done / state.total) * 100) :
    state.phase === "zipping"     ? Math.round((state.done / state.total) * 100) :
    state.phase === "saving" || state.phase === "done" ? 100 : 0;

  const label =
    state.phase === "fetching-urls" ? "Fájlok előkészítése..." :
    state.phase === "downloading"   ? `Képek letöltése (${state.done}/${state.total})` :
    state.phase === "zipping"       ? `Tömörítés (${state.done}/${state.total})` :
    state.phase === "saving"        ? "ZIP mentése..." :
    state.phase === "done"          ? "Letöltés kész!" :
    `Hiba: ${(state as any).message}`;

  const isDone = state.phase === "done";
  const isError = state.phase === "error";

  return (
    <div className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white border border-[#EDE8E0] w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-6">
          {isDone ? (
            <div className="w-14 h-14 border border-[#C8A882]/40 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.5" className="w-7 h-7"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          ) : isError ? (
            <div className="w-14 h-14 border border-red-200 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" className="w-7 h-7"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          ) : (
            <div className="w-14 h-14 border border-[#EDE8E0] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin"/>
            </div>
          )}
        </div>
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-5 h-px bg-[#C8A882]/40"/>
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">
              {isDone ? "Kész" : isError ? "Hiba" : "Folyamatban"}
            </span>
            <div className="w-5 h-px bg-[#C8A882]/40"/>
          </div>
          <h3 className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#1A1510] mb-1">
            {isDone ? "ZIP letöltve!" : isError ? "Letöltési hiba" : "ZIP összeállítása"}
          </h3>
          <p className="text-[12px] text-[#7A6A58]">{label}</p>
          {state.phase === "downloading" && state.currentFile && (
            <p className="text-[10px] text-[#A08060] mt-1 truncate max-w-xs mx-auto">{state.currentFile}</p>
          )}
        </div>
        {!isError && (
          <div className="mb-6">
            <div className="h-1 bg-[#EDE8E0] w-full">
              <div className="h-full bg-[#C8A882] transition-all duration-300" style={{ width: `${percent}%` }}/>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-[#A08060]">{percent}%</span>
              {(state.phase === "downloading" || state.phase === "zipping") && (
                <span className="text-[10px] text-[#A08060]">{state.done} / {state.total} fájl</span>
              )}
            </div>
          </div>
        )}
        {(isDone || isError) && (
          <button onClick={onClose} className="w-full py-3 bg-[#1A1510] text-white text-[11px] tracking-[0.14em] uppercase hover:bg-[#C8A882] transition-all">
            Bezárás
          </button>
        )}
      </div>
    </div>
  );
}

// ── Single videó letöltés progress overlay ────────────────────
function VideoDownloadOverlay({ state, onClose }: { state: VideoDownloadState; onClose: () => void }) {
  if (state.phase === "idle") return null;

  const isDone  = state.phase === "done";
  const isError = state.phase === "error";
  const percent = state.phase === "downloading" ? state.percent : isDone ? 100 : 0;

  return (
    <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-center justify-center px-4">
      <div className="bg-[#0E0C0A] border border-white/[0.08] w-full max-w-sm p-8">
        {/* Ikon */}
        <div className="flex items-center justify-center mb-6">
          {isDone ? (
            <div className="w-16 h-16 border border-[#C8A882]/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.2" className="w-8 h-8">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          ) : isError ? (
            <div className="w-16 h-16 border border-red-500/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.2" className="w-8 h-8">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
          ) : (
            <div className="relative w-16 h-16 flex items-center justify-center">
              {/* Körös progress */}
              <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2"/>
                <circle cx="32" cy="32" r="28" fill="none" stroke="#C8A882" strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - percent / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.3s ease" }}
                />
              </svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.2" className="w-7 h-7 relative z-10">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
              </svg>
            </div>
          )}
        </div>

        {/* Szöveg */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-5 h-px bg-[#C8A882]/30"/>
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#C8A882]/50">
              {isDone ? "Kész" : isError ? "Hiba" : "Videó letöltése"}
            </span>
            <div className="w-5 h-px bg-[#C8A882]/30"/>
          </div>
          <h3 className="font-['Cormorant_Garamond'] text-[1.5rem] font-light text-white mb-1">
            {isDone ? "Letöltés kész!" : isError ? "Letöltési hiba" : state.phase === "preparing" ? "Előkészítés..." : "Letöltés folyamatban"}
          </h3>
          {state.phase === "downloading" && (
            <p className="text-[11px] text-white/40 mt-1 truncate max-w-xs mx-auto">{state.fileName}</p>
          )}
          {isError && (
            <p className="text-[11px] text-red-400/70 mt-1">{(state as any).message}</p>
          )}
        </div>

        {/* Progress bar */}
        {!isError && (
          <div className="mb-6">
            <div className="h-px bg-white/[0.08] w-full">
              <div className="h-full bg-[#C8A882] transition-all duration-300" style={{ width: `${percent}%` }}/>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-white/30">
                {state.phase === "preparing" ? "Aláírt URL generálása..." : `${percent}%`}
              </span>
              {!isDone && state.phase !== "preparing" && (
                <span className="text-[10px] text-white/30">Kérjük várjon...</span>
              )}
            </div>
          </div>
        )}

        {(isDone || isError) && (
          <button onClick={onClose}
            className="w-full py-3 border border-white/[0.08] text-white text-[11px] tracking-[0.14em] uppercase hover:bg-white/[0.05] transition-all">
            Bezárás
          </button>
        )}
      </div>
    </div>
  );
}

// ── Justified Gallery ─────────────────────────────────────────
const GAP = 4;

function buildJustifiedRows(images: GalleryImage[], containerWidth: number, targetRowHeight: number): GalleryImage[][] {
  if (containerWidth <= 0) return [];
  const rows: GalleryImage[][] = [];
  let current: GalleryImage[] = [];
  let currentWidth = 0;
  for (const img of images) {
    const aspect = img.width && img.height ? img.width / img.height : 3 / 2;
    const imgW   = targetRowHeight * aspect;
    const gapAdd = current.length > 0 ? GAP : 0;
    if (current.length > 0 && currentWidth + gapAdd + imgW > containerWidth) {
      rows.push(current); current = [img]; currentWidth = imgW;
    } else { current.push(img); currentWidth += gapAdd + imgW; }
  }
  if (current.length > 0) rows.push(current);
  return rows;
}

function JustifiedGallery({ images, onImageClick, downloading, onDownload }: {
  images: GalleryImage[]; onImageClick: (i: number) => void;
  downloading: number | null; onDownload: (id: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => setContainerWidth(entries[0].contentRect.width));
    obs.observe(containerRef.current);
    setContainerWidth(containerRef.current.offsetWidth);
    return () => obs.disconnect();
  }, []);

  const targetRowHeight =
    containerWidth > 1400 ? 340 : containerWidth > 1100 ? 300 :
    containerWidth > 800  ? 260 : containerWidth > 500  ? 200 : 150;

  const sorted = [...images].sort((a, b) =>
    (a.fileName ?? "").localeCompare(b.fileName ?? "", undefined, { numeric: true, sensitivity: "base" })
  );
  const rows = buildJustifiedRows(sorted, containerWidth, targetRowHeight);

  return (
    <div ref={containerRef} className="w-full">
      {rows.map((row, rowIdx) => {
        const aspects       = row.map(img => img.width && img.height ? img.width / img.height : 3/2);
        const totalNaturalW = aspects.reduce((s, a) => s + a * targetRowHeight, 0);
        const isLastRow     = rowIdx === rows.length - 1;
        const scale         = isLastRow ? 1 : (containerWidth - (row.length - 1) * GAP) / totalNaturalW;
        const rowH          = isLastRow ? targetRowHeight : targetRowHeight * scale;
        return (
          <div key={rowIdx} className="flex" style={{ gap: GAP, marginBottom: GAP }}>
            {row.map((img, j) => {
              const w = isLastRow ? aspects[j] * targetRowHeight : aspects[j] * rowH;
              const originalIdx = sorted.findIndex(s => s.id === img.id);
              return (
                <div key={img.id}
                  className="relative overflow-hidden group cursor-pointer flex-shrink-0 bg-[#222]"
                  style={{ width: w, height: rowH }}
                  onClick={() => onImageClick(originalIdx)}>
                  <img src={img.previewUrl} alt={img.fileName ?? ""} loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"/>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300"/>
                  <button onClick={e => { e.stopPropagation(); onDownload(img.id); }}
                    disabled={downloading === img.id}
                    className="absolute bottom-2 right-2 w-7 h-7 bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                    {downloading === img.id
                      ? <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin"/>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-3.5 h-3.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>}
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── Főkomponens ───────────────────────────────────────────────
export default function PublicGalleryPage() {
  const { token }         = useParams<{ token: string }>();
  const { data: session } = useSession();
  const galleryRef        = useRef<HTMLDivElement>(null);

  const [state, setState]           = useState<"loading"|"locked"|"unlocked"|"expired"|"error">("loading");
  const [gallery, setGallery]       = useState<GalleryData | null>(null);
  const [images, setImages]         = useState<GalleryImage[]>([]);
  const [videos, setVideos]         = useState<GalleryVideo[]>([]);
  const [password, setPassword]     = useState("");
  const [pwError, setPwError]       = useState("");
  const [unlocking, setUnlocking]   = useState(false);
  const [lightbox, setLightbox]     = useState<number | null>(null);
  const [videoModal, setVideoModal] = useState<GalleryVideo | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [activeTab, setActiveTab]   = useState<"photos"|"videos">("photos");
  const [zipState, setZipState]     = useState<ZipPhase>({ phase: "idle" });
  const [videoDownload, setVideoDownload] = useState<VideoDownloadState>({ phase: "idle" });
  const [expiredData, setExpiredData] = useState<{
    driveUrl: string | null; projectName: string | null; title: string | null; expiresAt: string | null;
  }>({ driveUrl: null, projectName: null, title: null, expiresAt: null });

  const sortedImages = [...images].sort((a, b) =>
    (a.fileName ?? "").localeCompare(b.fileName ?? "", undefined, { numeric: true, sensitivity: "base" })
  );

  async function load(pw?: string) {
    const url  = `/api/galleries/share/${token}${pw ? `?password=${encodeURIComponent(pw)}` : ""}`;
    const res  = await fetch(url);
    const data = await res.json();
    if (res.status === 410) {
      setExpiredData({ driveUrl: data.googleDriveUrl ?? null, projectName: data.projectName ?? null, title: data.title ?? null, expiresAt: data.expiresAt ?? null });
      setState("expired"); return;
    }
    if (res.status === 404 || res.status === 403) { setState("error"); return; }
    if (data.locked) {
      setGallery({ id: 0, title: data.title, description: null, coverImageUrl: null, expiresAt: null, hasPassword: true, isPublic: true, googleDriveUrl: data.googleDriveUrl ?? null, isExpired: false, project: { name: data.projectName, id: 0 }, _count: { images: data.imageCount } });
      setState("locked"); if (pw) setPwError("Helytelen jelszó"); return;
    }
    setGallery(data.gallery); setImages(data.images ?? []); setVideos(data.videos ?? []);
    setState("unlocked");
  }

  useEffect(() => { load(); }, [token]);
  useEffect(() => { if (session && state === "locked") load(); }, [session]);

  async function handleUnlock() {
    if (!password.trim()) return;
    setUnlocking(true); setPwError("");
    await load(password); setUnlocking(false);
  }

  // ── Kép letöltés (egyedi) ─────────────────────────────────
  async function handleImageDownload(imageId: number) {
    if (!gallery?.id) return;
    setDownloading(imageId);
    try {
      const res  = await fetch(`/api/galleries/${gallery.id}/download`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, password: password || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Letöltési hiba");
      const a = document.createElement("a"); a.href = data.url; a.download = data.fileName;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (e: any) { alert(e.message); }
    finally { setDownloading(null); }
  }

  // ── Videó letöltés XHR progress-szel ─────────────────────
  async function handleVideoDownload(videoId: number) {
    if (!gallery?.id) return;
    setVideoDownload({ phase: "preparing" });
    try {
      // 1. Signed URL lekérése
      const res  = await fetch(`/api/galleries/${gallery.id}/download`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, password: password || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Letöltési hiba");

      const fileName = data.fileName as string;
      setVideoDownload({ phase: "downloading", percent: 0, fileName });

      // 2. XHR-rel töltjük le progress-szel
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", data.url, true);
        xhr.responseType = "blob";

        xhr.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setVideoDownload({ phase: "downloading", percent: pct, fileName });
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const blob = xhr.response as Blob;
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement("a");
            a.href     = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setVideoDownload({ phase: "done" });
            resolve();
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Hálózati hiba"));
        xhr.send();
      });
    } catch (e: any) {
      setVideoDownload({ phase: "error", message: e.message ?? "Ismeretlen hiba" });
    }
  }

  // ── ZIP letöltés ──────────────────────────────────────────
  async function handleZipDownload() {
    if (!gallery?.id) return;
    setZipState({ phase: "fetching-urls" });
    try {
      const res  = await fetch(`/api/galleries/${gallery.id}/download`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hiba az URL-ek lekérésekor");
      const urls: { url: string; fileName: string; type: string }[] = data.urls ?? [];
      if (urls.length === 0) throw new Error("Nincs letölthető fájl");

      const JSZip = (await import("jszip")).default;
      const zip   = new JSZip();

      for (let i = 0; i < urls.length; i++) {
        const { url, fileName } = urls[i];
        setZipState({ phase: "downloading", done: i, total: urls.length, currentFile: fileName });
        const fileRes = await fetch(url);
        if (!fileRes.ok) throw new Error(`Nem sikerült letölteni: ${fileName}`);
        const blob = await fileRes.blob();
        const fileNameWithExt = getFileNameWithExt(fileName, url);
        zip.file(fileNameWithExt, blob);
        setZipState({ phase: "downloading", done: i + 1, total: urls.length, currentFile: fileNameWithExt });
      }

      setZipState({ phase: "zipping", done: 0, total: urls.length });
      const zipBlob = await zip.generateAsync(
        { type: "blob", compression: "DEFLATE", compressionOptions: { level: 1 } },
        meta => setZipState({ phase: "zipping", done: Math.round(meta.percent / 100 * urls.length), total: urls.length })
      );

      setZipState({ phase: "saving" });
      const { saveAs } = await import("file-saver");
      const safeTitle  = (gallery.title ?? "galeria").replace(/[^\w\-]/g, "_").replace(/_{2,}/g, "_");
      saveAs(zipBlob, `OptikArt_${safeTitle}.zip`);
      setZipState({ phase: "done" });
    } catch (e: any) {
      setZipState({ phase: "error", message: e.message ?? "Ismeretlen hiba" });
    }
  }

  // ── Loading ───────────────────────────────────────────────
  if (state === "loading") return (
    <div className="min-h-screen bg-[#1A1510] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin"/>
    </div>
  );

  if (state === "expired") return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 border border-[#EDE8E0] flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.3" className="w-7 h-7">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        {expiredData.projectName && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-6 h-px bg-[#C8A882]/40"/>
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">{expiredData.projectName}</span>
            <div className="w-6 h-px bg-[#C8A882]/40"/>
          </div>
        )}
        <h1 className="font-['Cormorant_Garamond'] text-[2.2rem] font-light text-[#1A1510] mb-2">Ez a galéria lejárt</h1>
        <p className="text-[13px] text-[#A08060] mb-8 leading-relaxed">
          A megosztási link érvényességi ideje lejárt{expiredData.expiresAt && ` (${new Date(expiredData.expiresAt).toLocaleDateString("hu-HU")})`}.
        </p>
        {expiredData.driveUrl ? (
          <div className="bg-white border border-[#EDE8E0] p-6 mb-4 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FAF8F4] border border-[#EDE8E0] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.3" className="w-5 h-5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div>
                <div className="text-[13px] font-medium text-[#1A1510]">Az anyagok elérhetők Google Drive-on</div>
                <div className="text-[11px] text-[#A08060]">Hosszú távú archívumon megőriztük</div>
              </div>
            </div>
            <a href={expiredData.driveUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#1A1510] text-white text-[11px] tracking-[0.14em] uppercase px-6 py-3 hover:bg-[#C8A882] transition-all">
              Google Drive megnyitása
            </a>
          </div>
        ) : (
          <div className="bg-white border border-[#EDE8E0] p-6 mb-4">
            <a href="mailto:business@optikart.hu"
              className="flex items-center justify-center gap-2 w-full border border-[#1A1510] text-[#1A1510] text-[11px] tracking-[0.14em] uppercase px-6 py-3 hover:bg-[#1A1510] hover:text-white transition-all">
              Kapcsolatfelvétel
            </a>
          </div>
        )}
        <p className="text-[11px] text-[#C8B8A0]">OptikArt · optikart.hu</p>
      </div>
    </div>
  );

  if (state === "error") return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="font-['Cormorant_Garamond'] text-[5rem] text-[#EDE8E0] leading-none mb-4">404</div>
        <h1 className="font-['Cormorant_Garamond'] text-[1.8rem] font-light text-[#1A1510] mb-2">Galéria nem található</h1>
        <p className="text-[13px] text-[#A08060]">A megadott link érvénytelen vagy a galéria törölve lett.</p>
      </div>
    </div>
  );

  if (state === "locked") return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 border border-[#EDE8E0] flex items-center justify-center mx-auto mb-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.3" className="w-6 h-6">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-5 h-px bg-[#C8A882]/40"/>
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">{gallery?.project.name ?? "Galéria"}</span>
            <div className="w-5 h-px bg-[#C8A882]/40"/>
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#1A1510] mb-1">{gallery?.title ?? "Jelszóvédett galéria"}</h1>
          {gallery?._count?.images ? <p className="text-[12px] text-[#A08060]">{gallery._count.images} fénykép</p> : null}
        </div>
        <div className="flex flex-col gap-3">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleUnlock()}
            placeholder="Jelszó megadása..."
            className="w-full bg-white border border-[#EDE8E0] text-[13px] text-[#1A1510] placeholder:text-[#C8B8A0] px-4 py-3 focus:outline-none focus:border-[#C8A882] transition-colors"
            autoFocus/>
          {pwError && <p className="text-[11px] text-red-500">{pwError}</p>}
          <button onClick={handleUnlock} disabled={unlocking || !password.trim()}
            className="py-3 bg-[#1A1510] text-[11px] tracking-[0.14em] uppercase text-white hover:bg-[#C8A882] transition-all disabled:opacity-50">
            {unlocking ? "Ellenőrzés..." : "Megnyitás →"}
          </button>
        </div>
      </div>
    </div>
  );

  const totalItems   = images.length + videos.length;
  const heroCoverUrl = gallery?.coverImageUrl ? upgradeToCoverUrl(gallery.coverImageUrl) : null;
  const { names, date } = parseHeroTitle(gallery?.title ?? null);

  return (
    <>
      <ZipProgressOverlay state={zipState} onClose={() => setZipState({ phase: "idle" })}/>
      <VideoDownloadOverlay state={videoDownload} onClose={() => setVideoDownload({ phase: "idle" })}/>

      <div className="min-h-screen bg-[#1A1510]">

        {/* ── LIGHTBOX ── */}
        {lightbox !== null && sortedImages[lightbox] && (
          <div className="fixed inset-0 z-[300] bg-black/96 flex items-center justify-center" onClick={() => setLightbox(null)}>
            <button onClick={e => { e.stopPropagation(); setLightbox(i => Math.max(0,(i??0)-1)); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={e => { e.stopPropagation(); setLightbox(i => Math.min(sortedImages.length-1,(i??0)+1)); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="relative max-w-5xl max-h-[85vh] mx-16" onClick={e => e.stopPropagation()}>
              <img src={sortedImages[lightbox].previewUrl} alt="" className="max-h-[85vh] max-w-full object-contain"/>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-white/50 truncate">{sortedImages[lightbox].fileName}</span>
                <button onClick={() => handleImageDownload(sortedImages[lightbox].id)}
                  className="shrink-0 flex items-center gap-1.5 text-[10px] uppercase text-white/60 hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Letöltés
                </button>
                <span className="text-[11px] text-white/30 shrink-0">{lightbox+1} / {sortedImages.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── VIDEÓ MODAL ── */}
        {videoModal && (
          <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center" onClick={() => setVideoModal(null)}>
            <button onClick={() => setVideoModal(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="w-full max-w-4xl mx-4" onClick={e => e.stopPropagation()}>
              <video src={videoModal.streamUrl} controls autoPlay className="w-full max-h-[75vh] bg-black" style={{ outline: "none" }}/>
              <div className="bg-black/80 px-4 py-2.5 flex items-center justify-between">
                <span className="text-[11px] text-white/60 truncate">{videoModal.fileName}</span>
                <button onClick={() => { setVideoModal(null); handleVideoDownload(videoModal.id); }}
                  className="flex items-center gap-1.5 text-[10px] uppercase text-white/60 hover:text-white transition-colors ml-4 shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Letöltés
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ PREMIUM HERO ═════════════════════════════════════ */}
        <div className="relative w-full h-screen overflow-hidden">
          {/* Cover */}
          {heroCoverUrl ? (
            <img src={heroCoverUrl} alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 30%" }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A1510] via-[#231C14] to-[#0E0A06]"/>
          )}

          {/* Rétegezett gradiens overlay */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.7) 100%)" }}/>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }}/>

          {/* Finom vignette */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)" }}/>

          {/* Felső sáv */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 sm:px-12 pt-8">
            {/* OptikArt logó */}
            <div className="flex items-center gap-3">
              <div className="w-px h-6 bg-white/20"/>
              <span className="text-white/50 text-[10px] tracking-[0.3em] uppercase font-light">OptikArt</span>
            </div>

            {/* Számok */}
            <div className="flex items-center gap-6">
              {images.length > 0 && (
                <div className="text-right">
                  <div className="text-white/70 font-light leading-none tabular-nums" style={{ fontSize: "1.4rem", fontFamily: "'Georgia', serif" }}>
                    {String(images.length).padStart(2, "0")}
                  </div>
                  <div className="text-[8px] tracking-[0.2em] uppercase text-white/30 mt-0.5">fotó</div>
                </div>
              )}
              {images.length > 0 && videos.length > 0 && (
                <div className="w-px h-8 bg-white/15"/>
              )}
              {videos.length > 0 && (
                <div className="text-right">
                  <div className="text-white/70 font-light leading-none tabular-nums" style={{ fontSize: "1.4rem", fontFamily: "'Georgia', serif" }}>
                    {String(videos.length).padStart(2, "0")}
                  </div>
                  <div className="text-[8px] tracking-[0.2em] uppercase text-white/30 mt-0.5">videó</div>
                </div>
              )}
            </div>
          </div>

          {/* Főtartalom – bal alsó */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-8 sm:px-12 pb-12 sm:pb-16">
            <div className="max-w-5xl">
              {/* Vékony arany vonal fent */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-px bg-[#C8A882]/60"/>
                <span className="text-[#C8A882]/60 text-[9px] tracking-[0.3em] uppercase">
                  {gallery?.project?.name ?? "Galéria"}
                </span>
              </div>

              {/* Nevek */}
              <h1
                className="font-light text-white mb-4"
                style={{
                  fontSize: "clamp(2.2rem, 7vw, 8rem)",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  lineHeight: 0.9,
                  textShadow: "0 4px 40px rgba(0,0,0,0.4)",
                }}
              >
                {names || gallery?.title}
              </h1>

              {/* Dátum + görgetés */}
              <div className="flex items-center justify-between flex-wrap gap-4 mt-6">
                <div className="flex items-center gap-4">
                  {date && (
                    <>
                      <div className="w-12 h-px bg-white/30"/>
                      <span className="text-white/50 tracking-[0.22em] uppercase font-light"
                        style={{ fontSize: "clamp(0.6rem, 0.9vw, 0.8rem)", fontFamily: "'Helvetica Neue', sans-serif" }}>
                        {formatHeroDate(date)}
                      </span>
                    </>
                  )}
                </div>

                {/* Görgetés gomb */}
                <button
                  onClick={() => galleryRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-3 text-white/40 hover:text-white/70 transition-all group"
                >
                  <span className="text-[9px] tracking-[0.2em] uppercase">Galéria megtekintése</span>
                  <div className="w-8 h-8 border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 translate-y-[1px] group-hover:translate-y-[3px] transition-transform duration-300">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Alsó progress bar dekoráció */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.06]"/>
        </div>

        {/* ══ GALÉRIA SZEKCIÓ ══════════════════════════════════ */}
        <div ref={galleryRef} className="bg-[#111111]">
          <div className="sticky top-0 z-20 bg-[#0E0E0E]/95 backdrop-blur-sm border-b border-white/[0.05]">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                {images.length > 0 && videos.length > 0 && (
                  <div className="flex border border-white/[0.08]">
                    <button onClick={() => setActiveTab("photos")}
                      className={`px-4 py-1.5 text-[10px] tracking-[0.1em] uppercase border-r border-white/[0.08] transition-all ${activeTab === "photos" ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60"}`}>
                      Fotók ({images.length})
                    </button>
                    <button onClick={() => setActiveTab("videos")}
                      className={`px-4 py-1.5 text-[10px] tracking-[0.1em] uppercase transition-all ${activeTab === "videos" ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60"}`}>
                      Videók ({videos.length})
                    </button>
                  </div>
                )}
                {gallery?.isExpired && <span className="text-[10px] text-amber-400/70">⚠ Lejárt galéria</span>}
              </div>
              <button onClick={handleZipDownload} disabled={zipState.phase !== "idle"}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/[0.18] text-white text-[11px] uppercase px-4 py-2 transition-all disabled:opacity-40">
                {zipState.phase !== "idle" && zipState.phase !== "done" && zipState.phase !== "error"
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>}
                Összes letöltése
              </button>
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto px-2 sm:px-3 py-3">
            {(activeTab === "photos" || videos.length === 0) && images.length > 0 && (
              <JustifiedGallery
                images={images}
                onImageClick={setLightbox}
                downloading={downloading}
                onDownload={handleImageDownload}
              />
            )}

            {(activeTab === "videos" || images.length === 0) && videos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {videos.map(v => (
                  <div key={v.id} className="group relative bg-[#1A1510] overflow-hidden cursor-pointer"
                    style={{ aspectRatio: "16/9" }} onClick={() => setVideoModal(v)}>
                    {v.thumbnailUrl
                      ? <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-80"/>
                      : <div className="w-full h-full flex items-center justify-center bg-[#1A1510]">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1" className="w-12 h-12 opacity-30"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-black/60 transition-all">
                        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 flex items-center justify-between">
                      <span className="text-[11px] text-white/80 truncate max-w-[60%]">{v.fileName}</span>
                      <div className="flex items-center gap-2">
                        {v.duration && <span className="text-[10px] text-white/50">{formatDuration(v.duration)}</span>}
                        {/* Letöltés gomb a kártyán */}
                        <button
                          onClick={e => { e.stopPropagation(); handleVideoDownload(v.id); }}
                          className="w-6 h-6 bg-white/10 flex items-center justify-center hover:bg-white/30 transition-colors opacity-0 group-hover:opacity-100">
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-3 h-3">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalItems === 0 && (
              <div className="text-center py-16">
                <p className="text-[13px] text-white/30">Még nincs anyag ebben a galériában.</p>
              </div>
            )}

            {gallery?.googleDriveUrl && !gallery.isExpired && (
              <div className="mt-10 border border-white/[0.08] p-6 flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-[13px] text-white/70 mb-1">Hosszú távú archiválás</h3>
                  <p className="text-[12px] text-white/35 mb-4">Az anyagokat Google Drive-on is megőriztük.</p>
                  <a href={gallery.googleDriveUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 text-white text-[11px] uppercase px-5 py-2.5 hover:bg-white/[0.18] transition-all">
                    Google Drive megnyitása →
                  </a>
                </div>
              </div>
            )}

            <div className="mt-10 pt-6 border-t border-white/[0.05] flex items-center justify-between">
              <span className="text-[11px] text-white/20">Készítette: OptikArt</span>
              {gallery?.expiresAt && !gallery.isExpired && (
                <span className="text-[11px] text-white/20">Elérhető: {new Date(gallery.expiresAt).toLocaleDateString("hu-HU")}-ig</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}