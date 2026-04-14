"use client";

// app/components/JustifiedGallery.tsx
//
// Justified galéria – minden sor azonos magasságú, képek kitöltik a szélességet.
// Elfogad portrait (2:3) és landscape (3:2) képeket vegyesen.
// Beépített lightbox, hover overlay, kategória szűrő.
//
// Használat:
//   import JustifiedGallery from "@/app/components/JustifiedGallery";
//
//   const images = [
//     { src: "/slides/foo.jpg", alt: "...", category: "Esküvő", orientation: "landscape" },
//     { src: "/slides/bar.jpg", alt: "...", category: "Portré", orientation: "portrait" },
//   ];
//
//   <JustifiedGallery images={images} rowHeight={280} gap={4} />

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

// ── Típusok ───────────────────────────────────────────────────
export type GalleryImage = {
  src: string;
  alt: string;
  category?: string;
  orientation: "landscape" | "portrait"; // landscape = 3:2, portrait = 2:3
};

type JustifiedRow = {
  images: GalleryImage[];
  // A sor képeinek kiszámított szélesség-arányai (0-1 között, összegük = 1)
  widths: number[];
};

type Props = {
  images: GalleryImage[];
  rowHeight?: number;        // Ideális sormagasság px-ben (default 300)
  gap?: number;              // Képek közötti rés px-ben (default 3)
  showCategories?: boolean;  // Szűrő gombok megjelenítése (default true)
  className?: string;
};

// ── Aspect ratio-k ────────────────────────────────────────────
const ASPECT = {
  landscape: 3 / 2,   // széles  → 1.5
  portrait:  2 / 3,   // álló    → 0.667
};

// ── Justified layout számítás ─────────────────────────────────
// Mohó algoritmus: képeket sorokba pakoljuk amíg a sor "tele" nem lesz
function buildRows(
  images: GalleryImage[],
  containerWidth: number,
  rowHeight: number,
  gap: number,
): JustifiedRow[] {
  if (!containerWidth) return [];

  const rows: JustifiedRow[] = [];
  let rowImages: GalleryImage[] = [];
  let rowRatio = 0;

  // Ideális: hány kép fér egy sorba ha mind rowHeight magas?
  // Egy kép szélessége = rowHeight * aspect
  // A sor "teli" ha az összes kép + gapok ≥ containerWidth
  const targetRatio = containerWidth / rowHeight;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const ar  = ASPECT[img.orientation];
    rowImages.push(img);
    rowRatio += ar;

    const gapTotal = (rowImages.length - 1) * gap;
    const scaledWidth = (containerWidth - gapTotal);

    // Ha eléggé teli a sor, vagy ez az utolsó kép
    if (rowRatio >= targetRatio * 0.85 || i === images.length - 1) {
      // Szélességek kiszámítása: arányosan töltjük ki a sort
      const widths = rowImages.map(im => {
        const ratio = ASPECT[im.orientation] / rowRatio;
        return ratio;
      });
      rows.push({ images: rowImages, widths });
      rowImages = [];
      rowRatio  = 0;
    }
  }

  return rows;
}

// ── Lightbox ──────────────────────────────────────────────────
function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const img = images[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")  onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[500] bg-[#0C0A08]/97 backdrop-blur-md flex items-center justify-center"
      onClick={onClose}
    >
      {/* Bezárás */}
      <button
        className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        onClick={onClose}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Számlál */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 font-['Cormorant_Garamond'] text-[1rem] font-light text-white/30 tabular-nums">
        {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
      </div>

      {/* Bal nyíl */}
      {index > 0 && (
        <button
          className="absolute left-4 z-10 w-14 h-14 flex items-center justify-center text-white/30 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
          onClick={e => { e.stopPropagation(); onPrev(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Jobb nyíl */}
      {index < images.length - 1 && (
        <button
          className="absolute right-4 z-10 w-14 h-14 flex items-center justify-center text-white/30 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
          onClick={e => { e.stopPropagation(); onNext(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Kép */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          className="max-w-[90vw] max-h-[85vh] object-contain shadow-2xl"
          style={{ animation: "lbFadeIn 0.25s ease" }}
        />
        {img.alt && (
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 text-center">
            <p className="text-[11px] tracking-[0.12em] uppercase text-white/40">{img.alt}</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes lbFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ── Fő komponens ──────────────────────────────────────────────
export default function JustifiedGallery({
  images,
  rowHeight = 300,
  gap = 3,
  showCategories = true,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>("Mind");
  const [lightboxIdx, setLightboxIdx]       = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx]         = useState<number | null>(null);

  // Container width mérés + resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // Szűrés
  const categories = ["Mind", ...Array.from(new Set(images.map(i => i.category).filter(Boolean) as string[]))];

  const filtered = activeCategory === "Mind"
    ? images
    : images.filter(img => img.category === activeCategory);

  // Justified sorok kiszámítása
  // Mobilon kisebb rowHeight
  const effectiveRowHeight = typeof window !== "undefined" && window.innerWidth < 640
    ? Math.round(rowHeight * 0.65)
    : rowHeight;

  const rows = buildRows(filtered, containerWidth, effectiveRowHeight, gap);

  // Lightbox index a filtered tömbben
  const openLightbox = useCallback((filteredIdx: number) => {
    setLightboxIdx(filteredIdx);
  }, []);

  return (
    <div className={className}>

      {/* Kategória szűrők */}
      {showCategories && categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 border transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-[#1A1510] border-[#1A1510] text-white"
                  : "border-[#EDE8E0] text-[#A08060] hover:border-[#C8A882]/60 hover:text-[#1A1510]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Galéria */}
      <div ref={containerRef} className="w-full">
        {containerWidth > 0 && rows.map((row, rowIdx) => {
          const gapTotal = (row.images.length - 1) * gap;

          return (
            <div
              key={rowIdx}
              className="flex"
              style={{ gap: `${gap}px`, marginBottom: `${gap}px` }}
            >
              {row.images.map((img, imgIdx) => {
                // Global index a filtered tömbben
                const globalIdx = rows
                  .slice(0, rowIdx)
                  .reduce((sum, r) => sum + r.images.length, 0) + imgIdx;

                const widthPct = row.widths[imgIdx] * 100;

                // Sor magassága: (containerWidth - gapok) / sum(aspectRatios)
                const totalAspect = row.images.reduce((s, im) => s + ASPECT[im.orientation], 0);
                const actualRowH  = Math.round((containerWidth - gapTotal) / totalAspect);

                // Ha ez az utolsó sor és csak 1-2 kép van, ne nyújtjuk ki
                const isLastRow      = rowIdx === rows.length - 1;
                const lastRowTooFew  = isLastRow && row.images.length <= 2 && filtered.length > 3;

                const isHovered = hoveredIdx === globalIdx;

                return (
                  <div
                    key={img.src + globalIdx}
                    className="relative overflow-hidden cursor-pointer flex-shrink-0"
                    style={{
                      // Ha utolsó sor és kevés kép: fix aspect ratio tartás
                      width: lastRowTooFew
                        ? `${ASPECT[img.orientation] * actualRowH}px`
                        : `calc(${widthPct}% - ${gap * (1 - row.widths[imgIdx])}px)`,
                      height: `${actualRowH}px`,
                      // will-change a smooth transform-hoz
                      willChange: "transform",
                    }}
                    onClick={() => openLightbox(globalIdx)}
                    onMouseEnter={() => setHoveredIdx(globalIdx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* Next.js Image – fill mód */}
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      quality={85}
                      sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`}
                      className="object-cover transition-transform duration-500"
                      style={{
                        transform: isHovered ? "scale(1.05)" : "scale(1)",
                        // landscape képeknél top, portraitnál center
                        objectPosition: img.orientation === "landscape" ? "center 30%" : "center center",
                      }}
                    />

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 transition-opacity duration-300 flex flex-col justify-end p-3"
                      style={{
                        opacity: isHovered ? 1 : 0,
                        background: "linear-gradient(to top, rgba(26,21,16,0.75) 0%, rgba(26,21,16,0.2) 50%, transparent 100%)",
                      }}
                    >
                      <div className="flex items-end justify-between">
                        <div>
                          {img.category && (
                            <span className="text-[8px] tracking-[0.18em] uppercase text-[#C8A882] block mb-0.5">
                              {img.category}
                            </span>
                          )}
                          <span className="text-[11px] font-light text-white">{img.alt}</span>
                        </div>
                        {/* Nagyítás ikon */}
                        <div className="w-7 h-7 border border-white/30 flex items-center justify-center shrink-0 ml-2">
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="w-3.5 h-3.5">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Üres állapot */}
        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-[13px] text-[#A08060]">Nincs kép ebben a kategóriában.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          images={filtered}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx(i => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setLightboxIdx(i => Math.min(filtered.length - 1, (i ?? 0) + 1))}
        />
      )}
    </div>
  );
}
