"use client";

// app/(public)/concert/JustifiedGallery.tsx
// Klasszikus "justified" (Flickr-stílusú) rácselrendezés: a képek a saját
// eredeti méretarányukkal jelennek meg, soronként pontosan kitöltve a
// konténer szélességét — nincs vágás, nincs torzítás.
//
// A konténer szélességét ResizeObserver-rel méri, ezért reszponzív.
// Kattintásra a kép nagyítva, lightboxban nyílik meg (nyilakkal / Esc-kel
// vezérelhető, háttérre kattintva bezáródik).

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

export interface JustifiedGalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface IndexedImage extends JustifiedGalleryImage {
  _i: number;
}

interface LaidOutImage extends IndexedImage {
  renderWidth: number;
  renderHeight: number;
}

interface Row {
  images: LaidOutImage[];
  height: number;
}

function layoutRows(images: IndexedImage[], containerWidth: number, targetHeight: number, gap: number): Row[] {
  if (containerWidth <= 0 || images.length === 0) return [];

  const rows: Row[] = [];
  let current: (IndexedImage & { aspect: number })[] = [];
  let aspectSum = 0;

  for (const img of images) {
    const aspect = img.width / img.height || 1;
    current.push({ ...img, aspect });
    aspectSum += aspect;
    const gapsWidth = gap * (current.length - 1);
    const widthAtTargetHeight = aspectSum * targetHeight + gapsWidth;

    if (widthAtTargetHeight >= containerWidth) {
      const rowHeight = (containerWidth - gapsWidth) / aspectSum;
      rows.push({
        height: rowHeight,
        images: current.map((c) => ({ ...c, renderWidth: c.aspect * rowHeight, renderHeight: rowHeight })),
      });
      current = [];
      aspectSum = 0;
    }
  }

  // Az utolsó, be nem telt sort nem nyújtjuk szét a teljes szélességre —
  // marad a célmagasságban, természetes méretarányban.
  if (current.length) {
    rows.push({
      height: targetHeight,
      images: current.map((c) => ({ ...c, renderWidth: c.aspect * targetHeight, renderHeight: targetHeight })),
    });
  }

  return rows;
}

function Lightbox({
  images,
  activeIndex,
  onClose,
  onNavigate,
}: {
  images: JustifiedGalleryImage[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const [visible, setVisible] = useState(false);
  const active = images[activeIndex];

  // Belépő fade — egy tick késleltetéssel, hogy legyen mihez animálni
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Háttérgörgetés letiltása amíg nyitva van
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Billentyűzet-vezérlés: Esc zár, ←/→ lapoz
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((activeIndex + 1) % images.length);
      if (e.key === "ArrowLeft") onNavigate((activeIndex - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, images.length, onClose, onNavigate]);

  if (!active) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ background: "rgba(6,5,5,0.96)" }}
      onClick={onClose}
    >
      {/* Bezárás */}
      <button
        onClick={onClose}
        aria-label="Bezárás"
        className="absolute top-5 right-5 sm:top-8 sm:right-8 w-10 h-10 flex items-center justify-center border border-white/15 text-white/60 hover:text-white hover:border-white/40 transition-colors z-[101]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      </button>

      {/* Előző */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((activeIndex - 1 + images.length) % images.length);
          }}
          aria-label="Előző kép"
          className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center border border-white/15 text-white/60 hover:text-white hover:border-white/40 transition-colors z-[101]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <polyline points="15 6 9 12 15 18" />
          </svg>
        </button>
      )}

      {/* Kép */}
      <div
        className={`relative max-w-[92vw] max-h-[86vh] transition-transform duration-300 ${
          visible ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={active.src}
          src={active.src}
          alt={active.alt}
          width={active.width}
          height={active.height}
          className="max-w-[92vw] max-h-[86vh] w-auto h-auto object-contain"
          sizes="92vw"
          quality={92}
          priority
        />
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="font-['Bebas_Neue'] text-white/70 text-[1rem] tracking-wide">{active.alt}</p>
          <p className="font-['Space_Grotesk'] text-white/30 text-[10px] tracking-[0.15em] uppercase shrink-0">
            {activeIndex + 1} / {images.length}
          </p>
        </div>
      </div>

      {/* Következő */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((activeIndex + 1) % images.length);
          }}
          aria-label="Következő kép"
          className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center border border-white/15 text-white/60 hover:text-white hover:border-white/40 transition-colors z-[101]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function JustifiedGallery({
  images,
  targetRowHeight = 280,
  targetRowHeightMobile = 160,
  gap = 6,
  className = "",
}: {
  images: JustifiedGalleryImage[];
  targetRowHeight?: number;
  targetRowHeightMobile?: number;
  gap?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const indexedImages: IndexedImage[] = useMemo(
    () => images.map((img, i) => ({ ...img, _i: i })),
    [images],
  );

  const rowHeight = containerWidth > 0 && containerWidth < 640 ? targetRowHeightMobile : targetRowHeight;
  const rows = useMemo(
    () => layoutRows(indexedImages, containerWidth, rowHeight, gap),
    [indexedImages, containerWidth, rowHeight, gap],
  );

  // Saját scroll-reveal — csak akkor fut, ha már ki vannak számolva a sorok,
  // így nem függ a szülő GSAP-kontextusának időzítésétől.
  useLayoutEffect(() => {
    if (!rows.length) return;
    let mounted = true;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!mounted || !containerRef.current) return;
      const items = containerRef.current.querySelectorAll(".jg-item:not([data-revealed])");
      if (!items.length) return;
      items.forEach((el) => el.setAttribute("data-revealed", "1"));
      gsap.fromTo(
        items,
        { autoAlpha: 0, scale: 0.97 },
        {
          autoAlpha: 1,
          scale: 1,
          stagger: 0.03,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: containerRef.current, start: "top 90%", once: true },
        },
      );
    })();
    return () => {
      mounted = false;
    };
  }, [rows.length]);

  return (
    <div ref={containerRef} className={`jg-grid flex flex-col ${className}`} style={{ gap }}>
      {rows.map((row, ri) => (
        <div key={ri} className="flex" style={{ gap }}>
          {row.images.map((img) => (
            <button
              key={`${img.src}-${img._i}`}
              type="button"
              onClick={() => setActiveIndex(img._i)}
              aria-label={`${img.alt} megnyitása nagyban`}
              className="jg-item relative overflow-hidden group cursor-pointer shrink-0 block p-0 border-0"
              style={{ width: img.renderWidth, height: row.height, opacity: 0 }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={Math.round(img.renderWidth)}
                height={Math.round(img.renderHeight)}
                className="w-full h-full object-cover brightness-55 group-hover:brightness-40 transition-all duration-700 group-hover:scale-105"
                sizes={`${Math.round(img.renderWidth)}px`}
                quality={78}
              />
              <div className="absolute inset-0 bg-[#060505]/0 group-hover:bg-[#060505]/40 transition-all duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                <p className="text-white font-['Bebas_Neue'] text-[1rem] tracking-wide">{img.alt}</p>
              </div>
            </button>
          ))}
        </div>
      ))}

      {activeIndex !== null && (
        <Lightbox
          images={images}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      )}
    </div>
  );
}