"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

// app/(public)/gallery/[token]/page.tsx

type GalleryImage = {
  id: number;
  thumbnailUrl: string;
  previewUrl: string;
  fileName: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
};

type GalleryData = {
  id: number;
  title: string | null;
  description: string | null;
  expiresAt: string | null;
  project: { name: string | null };
  _count: { images: number };
};

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PublicGalleryPage() {
  const { token } = useParams<{ token: string }>();

  const [state, setState]       = useState<"loading" | "locked" | "unlocked" | "expired" | "error">("loading");
  const [gallery, setGallery]   = useState<GalleryData | null>(null);
  const [images, setImages]     = useState<GalleryImage[]>([]);
  const [password, setPassword] = useState("");
  const [pwError, setPwError]   = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<number | "all" | null>(null);

  // Galériaadat betöltés
  async function load(pw?: string) {
    const url = `/api/galleries/share/${token}${pw ? `?password=${encodeURIComponent(pw)}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();

    if (res.status === 410) { setState("expired"); return; }
    if (res.status === 404 || res.status === 403) { setState("error"); return; }

    if (data.locked) {
      setGallery({ id: 0, title: data.title, description: null, expiresAt: null, project: { name: data.projectName }, _count: { images: data.imageCount } });
      setState("locked");
      if (pw) setPwError("Helytelen jelszó");
      return;
    }

    setGallery(data.gallery);
    setImages(data.images);
    setState("unlocked");
  }

  useEffect(() => { load(); }, [token]);

  async function handleUnlock() {
    if (!password.trim()) return;
    setUnlocking(true);
    setPwError("");
    await load(password);
    setUnlocking(false);
  }

  async function handleDownload(imageId?: number) {
    setDownloading(imageId ?? "all");
    try {
      const res = await fetch(`/api/galleries/${gallery?.id}/download`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ imageId, password: password || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (imageId) {
        const a = document.createElement("a");
        a.href = data.url; a.download = data.fileName; a.click();
      } else {
        for (const item of data.urls) {
          const a = document.createElement("a");
          a.href = item.url; a.download = item.fileName;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          await new Promise(r => setTimeout(r, 200));
        }
      }
    } catch (e: any) { alert(e.message); }
    finally { setDownloading(null); }
  }

  // ── Loading ────────────────────────────────────────────────
  if (state === "loading") return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#C8A882]/30 border-t-[#C8A882] rounded-full animate-spin" />
    </div>
  );

  // ── Hiba / lejárt ─────────────────────────────────────────
  if (state === "expired" || state === "error") return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="font-['Cormorant_Garamond'] text-[5rem] text-[#EDE8E0] leading-none mb-4">
          {state === "expired" ? "⏰" : "404"}
        </div>
        <h1 className="font-['Cormorant_Garamond'] text-[1.8rem] font-light text-[#1A1510] mb-2">
          {state === "expired" ? "Ez a galéria lejárt" : "Galéria nem található"}
        </h1>
        <p className="text-[13px] text-[#A08060]">
          {state === "expired"
            ? "A megosztási link érvényességi ideje lejárt."
            : "A megadott link érvénytelen vagy a galéria törölve lett."}
        </p>
      </div>
    </div>
  );

  // ── Jelszó képernyő ────────────────────────────────────────
  if (state === "locked") return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 border border-[#EDE8E0] flex items-center justify-center mx-auto mb-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="#C8A882" strokeWidth="1.3" className="w-6 h-6">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-5 h-px bg-[#C8A882]/40" />
            <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">{gallery?.project.name ?? "Galéria"}</span>
            <div className="w-5 h-px bg-[#C8A882]/40" />
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#1A1510] mb-1">
            {gallery?.title ?? "Jelszóvédett galéria"}
          </h1>
          {gallery?._count?.images && (
            <p className="text-[12px] text-[#A08060]">{gallery._count.images} fénykép</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleUnlock()}
            placeholder="Jelszó megadása..."
            className="w-full bg-white border border-[#EDE8E0] text-[13px] text-[#1A1510] placeholder:text-[#C8B8A0] px-4 py-3 focus:outline-none focus:border-[#C8A882] transition-colors"
            autoFocus
          />
          {pwError && <p className="text-[11px] text-red-500">{pwError}</p>}
          <button onClick={handleUnlock} disabled={unlocking || !password.trim()}
            className="py-3 bg-[#1A1510] text-[11px] tracking-[0.14em] uppercase text-white hover:bg-[#C8A882] transition-all disabled:opacity-50">
            {unlocking ? "Ellenőrzés..." : "Megnyitás →"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Lightbox ──────────────────────────────────────────────
  const LightboxEl = lightbox !== null && (
    <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center"
      onClick={() => setLightbox(null)}>
      <button onClick={e => { e.stopPropagation(); setLightbox(i => Math.max(0, (i ?? 0) - 1)); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button onClick={e => { e.stopPropagation(); setLightbox(i => Math.min(images.length - 1, (i ?? 0) + 1)); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <div className="relative max-w-5xl max-h-[85vh] mx-4" onClick={e => e.stopPropagation()}>
        <img src={images[lightbox].previewUrl} alt={images[lightbox].fileName ?? ""}
          className="max-h-[85vh] max-w-full object-contain" />
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-2 flex items-center justify-between gap-3">
          <span className="text-[11px] text-white/50 truncate">{images[lightbox].fileName}</span>
          <button onClick={() => handleDownload(images[lightbox].id)}
            className="shrink-0 flex items-center gap-1.5 text-[10px] tracking-[0.1em] uppercase text-white/60 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Letöltés
          </button>
          <span className="text-[11px] text-white/30 shrink-0">{lightbox + 1} / {images.length}</span>
        </div>
      </div>
    </div>
  );

  // ── Galéria nézet ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {LightboxEl}

      {/* Fejléc */}
      <div className="bg-white border-b border-[#EDE8E0] px-5 sm:px-8 lg:px-12 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-px bg-[#C8A882]" />
                <span className="text-[9px] tracking-[0.22em] uppercase text-[#A08060]">{gallery?.project.name}</span>
              </div>
              <h1 className="font-['Cormorant_Garamond'] text-[2rem] sm:text-[2.4rem] font-light text-[#1A1510] leading-tight">
                {gallery?.title ?? "Galéria"}
              </h1>
              {gallery?.description && (
                <p className="text-[13px] text-[#7A6A58] mt-2 max-w-lg">{gallery.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#EDE8E0]">
                <div>
                  <div className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#C8A882] leading-none">{images.length}</div>
                  <div className="text-[9px] tracking-[0.12em] uppercase text-[#A08060]">fénykép</div>
                </div>
                {gallery?.expiresAt && (
                  <div>
                    <div className="text-[12px] text-[#1A1510]">{new Date(gallery.expiresAt).toLocaleDateString("hu-HU")}</div>
                    <div className="text-[9px] tracking-[0.12em] uppercase text-[#A08060]">elérhető eddig</div>
                  </div>
                )}
              </div>
            </div>

            {/* Letöltés gomb */}
            <button onClick={() => handleDownload()} disabled={downloading === "all"}
              className="flex items-center gap-2 bg-[#1A1510] text-white text-[11px] tracking-[0.12em] uppercase px-5 py-3 hover:bg-[#C8A882] transition-all disabled:opacity-50 whitespace-nowrap self-start">
              {downloading === "all"
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
              Összes letöltése
            </button>
          </div>
        </div>
      </div>

      {/* Képek grid */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {images.map((img, i) => (
            <div key={img.id} className="group relative bg-[#F0EBE3] overflow-hidden cursor-pointer"
              style={{ aspectRatio: "4/3" }}
              onClick={() => setLightbox(i)}>
              <img src={img.thumbnailUrl} alt={img.fileName ?? ""}
                loading="lazy"
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-90" />

              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 flex items-end justify-between p-2.5">
                <span className="text-[10px] text-white/80 truncate max-w-[70%]">{img.fileName}</span>
                <button
                  onClick={e => { e.stopPropagation(); handleDownload(img.id); }}
                  disabled={downloading === img.id}
                  className="w-7 h-7 bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors shrink-0">
                  {downloading === img.id
                    ? <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                    : <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
                </button>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[13px] text-[#A08060]">Még nincs kép ebben a galériában.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#EDE8E0] flex items-center justify-between">
          <span className="text-[11px] text-[#C8B8A0]">Készítette: OptikArt</span>
          {gallery?.expiresAt && (
            <span className="text-[11px] text-[#C8B8A0]">
              Elérhető: {new Date(gallery.expiresAt).toLocaleDateString("hu-HU")}-ig
            </span>
          )}
        </div>
      </div>
    </div>
  );
}