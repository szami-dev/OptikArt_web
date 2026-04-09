"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

// ── Típusok ───────────────────────────────────────────────────
type GalleryImage = {
  src: string;
  category: string;
  filename: string;
  width?: number;   // betöltés után kerül be
  height?: number;
};

type GalleryVideo = {
  id: string;
  youtubeId?: string;
  videoSrc?: string;
  thumb: string;
  alt: string;
  category: string;
};

type MediaItem =
  | { kind: "photo"; data: GalleryImage }
  | { kind: "video"; data: GalleryVideo };

// ── Kategória konfig ──────────────────────────────────────────
const CATEGORIES = [
  { id: "all",       label: "Összes" },
  { id: "wedding",   label: "Esküvő" },
  { id: "portrait",  label: "Portré" },
  { id: "event",     label: "Rendezvény" },
  { id: "marketing", label: "Marketing" },
  { id: "drone",     label: "Drón" },
];

// ── Justified layout számítás ─────────────────────────────────
// Minden képnek kell width+height. A sor addig töltődik amíg
// eléri a targetWidth-t, majd az összes képet arányosan skálázza.
type RowItem = {
  item: MediaItem;
  displayWidth: number;
  displayHeight: number;
};

function buildJustifiedRows(
  items: MediaItem[],
  containerWidth: number,
  targetRowHeight: number,
  gap: number
): RowItem[][] {
  if (containerWidth <= 0) return [];

  const rows: RowItem[][] = [];
  let currentRow: { item: MediaItem; aspectRatio: number }[] = [];
  let currentRowWidth = 0;

  for (const item of items) {
    // Aspect ratio meghatározása
    let ar = 4 / 3; // default
    if (item.kind === "photo" && item.data.width && item.data.height) {
      ar = item.data.width / item.data.height;
    } else if (item.kind === "video") {
      ar = 16 / 9;
    }

    const itemWidth = targetRowHeight * ar;
    const gapWidth = currentRow.length * gap;

    if (currentRowWidth + gapWidth + itemWidth > containerWidth && currentRow.length > 0) {
      // Sor lezárása és skálázás
      rows.push(scaleRow(currentRow, containerWidth, gap));
      currentRow = [];
      currentRowWidth = 0;
    }

    currentRow.push({ item, aspectRatio: ar });
    currentRowWidth += itemWidth;
  }

  // Utolsó (nem teli) sor – ne skálázd fel, maradjon kisebb
  if (currentRow.length > 0) {
    const lastRow: RowItem[] = currentRow.map(({ item, aspectRatio }) => ({
      item,
      displayWidth: targetRowHeight * aspectRatio,
      displayHeight: targetRowHeight,
    }));
    rows.push(lastRow);
  }

  return rows;
}

function scaleRow(
  row: { item: MediaItem; aspectRatio: number }[],
  containerWidth: number,
  gap: number
): RowItem[] {
  const totalGap = (row.length - 1) * gap;
  const totalNaturalWidth = row.reduce((sum, { aspectRatio }) => sum + aspectRatio, 0);
  const scale = (containerWidth - totalGap) / totalNaturalWidth;

  return row.map(({ item, aspectRatio }) => ({
    item,
    displayWidth: aspectRatio * scale,
    displayHeight: scale,
  }));
}

// ── Lightbox ──────────────────────────────────────────────────
function Lightbox({
  item,
  onClose,
  onPrev,
  onNext,
  index,
  total,
}: {
  item: MediaItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  index: number;
  total: number;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose, onPrev, onNext]);

  const isPhoto = item.kind === "photo";
  const src = isPhoto ? item.data.src : item.data.thumb;
  const alt = isPhoto ? item.data.filename : item.data.alt;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-white/96 backdrop-blur-md" />

      <div className="relative z-10 w-full max-w-6xl mx-4 flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Fejléc */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-3">
            {item.kind === "photo" && (
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]">
                {CATEGORIES.find(c => c.id === item.data.category)?.label}
              </span>
            )}
            {item.kind === "video" && (
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]">
                {CATEGORIES.find(c => c.id === item.data.category)?.label} · Videó
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-[#A08060] tabular-nums">{index + 1} / {total}</span>
            <button onClick={onClose} className="w-8 h-8 border border-[#EDE8E0] flex items-center justify-center text-[#A08060] hover:text-[#1A1510] hover:border-[#C8A882] transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Média */}
        <div className="relative bg-[#FAF8F4] border border-[#EDE8E0]">
          {isPhoto ? (
            <div className="relative w-full" style={{ height: "78vh" }}>
              <Image
                src={item.data.src}
                alt={alt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 90vw"
                quality={90}
              />
            </div>
          ) : item.kind === "video" && item.data.youtubeId ? (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${item.data.youtubeId}?autoplay=1&rel=0`}
                title={item.data.alt}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen className="w-full h-full"
              />
            </div>
          ) : item.kind === "video" && item.data.videoSrc ? (
            <div className="aspect-video">
              <video src={item.data.videoSrc} controls autoPlay className="w-full h-full object-contain" />
            </div>
          ) : null}

          {/* Prev / Next */}
          <button onClick={onPrev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 border border-[#EDE8E0] flex items-center justify-center text-[#7A6A58] hover:text-[#1A1510] hover:border-[#C8A882] transition-all backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button onClick={onNext} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 border border-[#EDE8E0] flex items-center justify-center text-[#7A6A58] hover:text-[#1A1510] hover:border-[#C8A882] transition-all backdrop-blur-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        {/* Alt */}
        <div className="mt-3 px-1">
          <p className="font-['Cormorant_Garamond'] text-[1rem] font-light text-[#7A6A58]">{alt}</p>
        </div>
      </div>
    </div>
  );
}

// ── Galéria kártya ────────────────────────────────────────────
function GalleryCard({
  item,
  width,
  height,
  onClick,
}: {
  item: MediaItem;
  width: number;
  height: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isVideo = item.kind === "video";
  const src = item.kind === "photo" ? item.data.src : item.data.thumb;
  const alt = item.kind === "photo" ? item.data.filename : item.data.alt;

  return (
    <div
      className="relative overflow-hidden cursor-pointer shrink-0 group"
      style={{ width: `${width}px`, height: `${height}px` }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Kép */}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-transform duration-600 ${hovered ? "scale-[1.04]" : "scale-100"}`}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        quality={75}
      />

      {/* Videó play */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border ${hovered ? "bg-[#C8A882] border-[#C8A882] scale-110" : "bg-white/50 border-white/60 backdrop-blur-sm"}`}>
            <svg viewBox="0 0 24 24" fill={hovered ? "white" : "#1A1510"} className="w-4 h-4 ml-0.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      )}

      {/* Hover overlay – nagyon finom */}
      <div className={`absolute inset-0 transition-opacity duration-400 ${hovered ? "opacity-100" : "opacity-0"}`}
        style={{ background: "linear-gradient(to top, rgba(26,21,16,0.55) 0%, rgba(26,21,16,0.05) 45%, transparent 100%)" }}
      />

      {/* Info hover-re */}
      <div className={`absolute bottom-0 left-0 right-0 px-3 py-2.5 transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
        <div className="flex items-end justify-between gap-2">
          <p className="text-white text-[11px] font-['Cormorant_Garamond'] font-light leading-tight truncate">{alt.replace(/\.[^/.]+$/, "").replace(/-/g, " ")}</p>
          {isVideo && (
            <span className="shrink-0 text-[7px] tracking-[0.1em] uppercase bg-[#C8A882] text-white px-1.5 py-0.5">video</span>
          )}
        </div>
      </div>

      {/* Sarokdísz */}
      <div className={`absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t border-r transition-all duration-400 ${hovered ? "border-white/50 opacity-100" : "opacity-0"}`} />
    </div>
  );
}

// ── Fő galéria oldal ──────────────────────────────────────────
export default function GalleryPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [imagesReady, setImagesReady] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("all");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [rows, setRows] = useState<{ item: MediaItem; displayWidth: number; displayHeight: number }[][]>([]);

  const ROW_HEIGHT = 220; // cél sormagasság px-ben
  const GAP = 4;

  // ── 1. API hívás ─────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => {
        setImages(data.images);
        setVideos(data.videos);
      })
      .catch(console.error);
  }, []);

  // ── 2. Képek mérete – az API route-ból jön, nem kell kliens oldali betöltés ──
  useEffect(() => {
    if (images.length === 0 && videos.length === 0) return;
    // Az API route-ban sharp-pal olvassuk a méreteket (lásd route.ts)
    // Ha nincs width/height, a justified layout 4:3 default-ot használ
    setImagesReady(images);
    setLoading(false);
  }, [images, videos]);

  // ── 3. Container szélesség figyelése ─────────────────────────
  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(Math.floor(entry.contentRect.width));
      }
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── 4. Justified layout újraszámítás ─────────────────────────
  useEffect(() => {
    if (containerWidth === 0) return;

    // Szűrt elemek összerakása
    const filteredPhotos: MediaItem[] = imagesReady
      .filter((img) => activeFilter === "all" || img.category === activeFilter)
      .map((img) => ({ kind: "photo", data: img }));

    const filteredVideos: MediaItem[] = videos
      .filter((v) => activeFilter === "all" || v.category === activeFilter)
      .map((v) => ({ kind: "video", data: v }));

    // Videókat a megfelelő kategória képei közé keverve jelenítjük meg
    // (minden 4. elem után egy videó ha van)
    const mixed: MediaItem[] = [];
    let vi = 0;
    filteredPhotos.forEach((p, i) => {
      mixed.push(p);
      if ((i + 1) % 4 === 0 && vi < filteredVideos.length) {
        mixed.push(filteredVideos[vi++]);
      }
    });
    // Maradék videók a végére
    while (vi < filteredVideos.length) mixed.push(filteredVideos[vi++]);

    const newRows = buildJustifiedRows(mixed, containerWidth, ROW_HEIGHT, GAP);
    setRows(newRows);
  }, [imagesReady, videos, activeFilter, containerWidth]);

  // ── 5. Lapos item lista lightboxhoz ──────────────────────────
  const flatItems: MediaItem[] = rows.flat().map((r) => r.item);

  // ── 6. GSAP header animáció ───────────────────────────────────
  useEffect(() => {
    let ctx: any;
    let mounted = true;
    async function init() {
      const { gsap } = await import("gsap");
      if (!mounted) return;
      ctx = gsap.context(() => {
        gsap.fromTo(".gl-header > *",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 0.7, ease: "power3.out" }
        );
      }, rootRef);
    }
    init();
    return () => { mounted = false; ctx?.revert(); };
  }, []);

  // ── Lightbox navigáció ────────────────────────────────────────
  const goNext = useCallback(() => {
    if (lightboxIdx === null) return;
    setLightboxIdx((lightboxIdx + 1) % flatItems.length);
  }, [lightboxIdx, flatItems.length]);

  const goPrev = useCallback(() => {
    if (lightboxIdx === null) return;
    setLightboxIdx((lightboxIdx - 1 + flatItems.length) % flatItems.length);
  }, [lightboxIdx, flatItems.length]);

  // Kategória stats
  const getCategoryCount = (catId: string) => {
    if (catId === "all") return imagesReady.length + videos.length;
    return imagesReady.filter(i => i.category === catId).length +
           videos.filter(v => v.category === catId).length;
  };

  return (
    <div ref={rootRef} className="min-h-screen bg-white">

      {/* ══════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════ */}
      <div className="gl-header pt-14 pb-10 px-6 sm:px-10 lg:px-14 max-w-[1600px] mx-auto flex flex-col gap-4">

        <div className="flex items-center gap-3">
          <div className="w-8 h-px bg-[#C8A882]" />
          <span className="text-[9px] tracking-[0.28em] uppercase text-[#A08060]">OptikArt · Galéria</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <h1
            className="font-['Cormorant_Garamond'] font-thin text-[#1A1510] leading-[0.9] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.8rem, 6vw, 6rem)" }}
          >
            <span className="block">Munkáink</span>
            <em className="block not-italic text-[#C8A882]">gyűjteménye</em>
          </h1>

          <div className="flex gap-7 sm:pb-1">
            {[
              { n: `${imagesReady.length}+`, l: "Fotó" },
              { n: `${videos.length}+`, l: "Videó" },
              { n: "5", l: "Kategória" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-['Cormorant_Garamond'] text-[1.6rem] font-light text-[#C8A882] leading-none">{s.n}</div>
                <div className="text-[8px] tracking-[0.15em] uppercase text-[#A08060] mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FILTER BAR – sticky
      ══════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EDE8E0]">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-14">
          <div className="flex items-center gap-0.5 py-2.5 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat) => {
              const count = getCategoryCount(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-[10px] tracking-[0.12em] uppercase whitespace-nowrap transition-all duration-200 shrink-0 ${
                    activeFilter === cat.id
                      ? "bg-[#1A1510] text-white"
                      : "text-[#7A6A58] hover:text-[#1A1510] hover:bg-[#FAF8F4]"
                  }`}
                >
                  {cat.label}
                  <span className={`text-[9px] tabular-nums ${activeFilter === cat.id ? "text-white/50" : "text-[#C8A882]/60"}`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Jobb oldali info */}
            <div className="ml-auto flex items-center gap-3 shrink-0 pl-4 border-l border-[#EDE8E0]">
              <span className="text-[9px] tracking-[0.08em] text-[#A08060]/60 hidden sm:block">
                {imagesReady.filter(i => activeFilter === "all" || i.category === activeFilter).length} fotó
                · {videos.filter(v => activeFilter === "all" || v.category === activeFilter).length} videó
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          JUSTIFIED GALÉRIA
      ══════════════════════════════════════════ */}
      <div
        ref={containerRef}
        className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 py-5"
      >

        {/* Betöltés */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1 h-8 bg-[#C8A882]/30 animate-pulse rounded-sm"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <span className="text-[10px] tracking-[0.15em] uppercase text-[#A08060]/50">Galéria betöltése...</span>
          </div>
        )}

        {/* Üres állapot */}
        {!loading && rows.flat().length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="w-12 h-px bg-[#C8A882]/40" />
            <p className="text-[13px] text-[#A08060]">Nincs elem ebben a kategóriában.</p>
          </div>
        )}

        {/* Justified sorok */}
        {!loading && rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex"
            style={{ gap: `${GAP}px`, marginBottom: `${GAP}px` }}
          >
            {row.map((cell, cellIdx) => {
              const flatIdx = rows
                .slice(0, rowIdx)
                .reduce((sum, r) => sum + r.length, 0) + cellIdx;

              return (
                <GalleryCard
                  key={
                    cell.item.kind === "photo"
                      ? cell.item.data.src
                      : cell.item.data.id
                  }
                  item={cell.item}
                  width={Math.floor(cell.displayWidth)}
                  height={Math.floor(cell.displayHeight)}
                  onClick={() => setLightboxIdx(flatIdx)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          LIGHTBOX
      ══════════════════════════════════════════ */}
      {lightboxIdx !== null && flatItems[lightboxIdx] && (
        <Lightbox
          item={flatItems[lightboxIdx]}
          onClose={() => setLightboxIdx(null)}
          onPrev={goPrev}
          onNext={goNext}
          index={lightboxIdx}
          total={flatItems.length}
        />
      )}
    </div>
  );
}