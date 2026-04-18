"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import Image from "next/image";
import Link  from "next/link";

const ROW_H_VW   = 16;
const ROW_GAP_VW = 0.4;
const MAX_ROW_VW = 52;

const slides = [
  {
    id: "eskuvo", number: "01", title: "Esküvő",
    subtitle: "A ti történetetek, örökre.",
    description: "Professzionális esküvői fotózás és videózás, amely megőrzi a nagy nap minden pillanatát — természetes, időtlen stílusban.",
    href: "/wedding", tags: ["Fotózás", "Videózás", "Highlight film"],
    theme: "light" as const, bg: "#FAF8F4", accent: "#C8A882",
    images: [
      { type: "image" as const, src: "/gallery/wedding/arankatibor-15.JPG",  alt: "Esküvői pár",  aspect: 3/2 },
      { type: "image" as const, src: "/gallery/wedding/keszulodes-90.JPG",   alt: "Menyasszony",  aspect: 3/2 },
      { type: "video" as const, src: "/gallery/wedding/kreativ-97.JPG",      alt: "Esküvői film", aspect: 3/2, youtubeId: "3sQo_md2CqI" },
      { type: "image" as const, src: "/gallery/wedding/vanizoli-210.jpg",    alt: "Gyűrűk",       aspect: 3/2 },
    ],
    stat: { n: "120+", l: "Esküvő" },
  },
  {
    id: "portre", number: "02", title: "Portré",
    subtitle: "Pillantások — arcok, pillanatok, emlékek.",
    description: "Páros, jegyes, családi és egyéni portré fotózás. Természetes fényben, valódi pillanatokból.",
    href: "/portrait", tags: ["Páros", "Családi", "Egyéni portré"],
    theme: "light" as const, bg: "#FFFFFF", accent: "#C8A882",
    images: [
      { type: "image" as const, src: "/gallery/portrait/napraforgo-27.JPG",       alt: "Portré",   aspect: 2/3 },
      { type: "image" as const, src: "/assets/zugiviki-15.JPG",                   alt: "Portré 2", aspect: 2/3 },
      { type: "image" as const, src: "/gallery/portrait/marcidorina-76 (1).JPG",  alt: "Páros",    aspect: 3/2 },
      { type: "image" as const, src: "/gallery/portrait/amiraek-91.jpg",          alt: "Família",  aspect: 3/2 },
      { type: "image" as const, src: "/gallery/portrait/olivia-131.JPG",          alt: "Családi",  aspect: 2/3 },
      { type: "image" as const, src: "/gallery/portrait/SzaboReka-1_pp_pp.jpg",   alt: "Egyéni",   aspect: 2/3 },
    ],
    stat: { n: "350+", l: "Portré" },
  },
  {
    id: "rendezvenyek", number: "03", title: "Rendezvény",
    subtitle: "Minden pillanat számít.",
    description: "Céges rendezvény, fesztivál, party vagy konferencia — mi ott vagyunk és megörökítjük az energiát.",
    href: "/event", tags: ["Céges", "Fesztivál", "Magán"],
    theme: "dark" as const, bg: "#1A1410", accent: "#C8A882",
    images: [
      { type: "image" as const, src: "/gallery/event/ballagaspg-192.JPG",   alt: "Ballagás",  aspect: 3/2 },
      { type: "video" as const, src: "/gallery/event/borfesztUTSO-140.JPG", alt: "Event reel",aspect: 3/2, youtubeId: "LbDrYcfLCRE" },
      { type: "image" as const, src: "/gallery/event/borfesztUTSO-106.JPG", alt: "Tömeg",     aspect: 3/2 },
      { type: "image" as const, src: "/gallery/event/borfesztUTSO-190.JPG", alt: "Kurultáj",  aspect: 3/2 },
    ],
    stat: { n: "80+", l: "Rendezvény" },
  },
  {
    id: "marketing", number: "04", title: "Marketing",
    subtitle: "Content, ami megállít.",
    description: "Professzionális fotó és short-form videó tartalom — Instagram, TikTok, Facebook.",
    href: "/marketing", tags: ["Instagram", "TikTok", "Brand film"],
    theme: "light" as const, bg: "#FAF8F4", accent: "#1A1510",
    images: [
      { type: "image" as const, src: "/gallery/marketing/siriusjanuar-28.JPG",   alt: "Termékfotó",  aspect: 3/2  },
      { type: "image" as const, src: "/gallery/marketing/siriusMarcius-6.JPG",   alt: "Márkafotó",   aspect: 2/3  },
      { type: "video" as const, src: "/gallery/marketing/siriusMarcius-6.JPG",   alt: "Brand film",  aspect: 9/16, youtubeId: "EnHDwBumuqY" },
      { type: "image" as const, src: "/gallery/marketing/bippu-35.JPG",          alt: "Brand",       aspect: 3/2  },
      { type: "image" as const, src: "/gallery/marketing/pellikanmarcius-4.JPG", alt: "Influencer",  aspect: 2/3  },
      { type: "video" as const, src: "/gallery/marketing/siriusjanuar-28.JPG",   alt: "Termékfilm",  aspect: 9/16, youtubeId: "oGcB8-IUlj8" },
    ],
    stat: { n: "500+", l: "Poszt/hó" },
  },
];

type SlideImage = (typeof slides)[0]["images"][0];

// ── buildRows: PURE fn, komponensen kívül → nem fut újra renderelésnél ──
function buildRows(images: SlideImage[], rowH: number, rowGap: number, maxW: number): SlideImage[][] {
  const rows: SlideImage[][] = [];
  let current: SlideImage[]  = [];
  let currentW = 0;
  for (const img of images) {
    const imgW   = rowH * img.aspect;
    const gapAdd = current.length > 0 ? rowGap : 0;
    if (current.length > 0 && currentW + gapAdd + imgW > maxW) {
      rows.push(current);
      current  = [img];
      currentW = imgW;
    } else {
      current.push(img);
      currentW += gapAdd + imgW;
    }
  }
  if (current.length > 0) rows.push(current);
  return rows;
}

// ── VideoModal ────────────────────────────────────────────────
function VideoModal({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/96 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      style={{ zIndex: 9999 }} onClick={onClose}>
      <div className="relative w-full max-w-5xl" style={{ aspectRatio: "16/9", zIndex: 10000 }}
        onClick={e => e.stopPropagation()}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title="Videó"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen className="absolute inset-0 w-full h-full" style={{ border: "none" }}
        />
      </div>
      <button className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        style={{ zIndex: 10001 }} onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

// ── JustifiedGallery ──────────────────────────────────────────
// memo: csak akkor renderel újra ha props változik
// NEM tartalmaz saját vw state-et – kívülről kapja számított értékként
const JustifiedGallery = memo(function JustifiedGallery({
  images, accent, onVideoClick, rowH, rowGap, maxW, priority = false,
}: {
  images: SlideImage[];
  accent: string;
  onVideoClick: (id: string) => void;
  rowH: number;
  rowGap: number;
  maxW: number;
  priority?: boolean; // első slide képei priority=true → azonnali betöltés
}) {
  const rows = buildRows(images, rowH, rowGap, maxW);

  return (
    <div className="flex flex-col" style={{ gap: rowGap }}>
      {rows.map((row, i) => (
        <div key={i} className="flex items-stretch" style={{ gap: rowGap }}>
          {row.map((img, j) => {
            const w = Math.round(rowH * img.aspect);

            if (img.type === "video" && img.youtubeId) {
              return (
                <div key={j}
                  className="relative overflow-hidden cursor-pointer group flex-shrink-0"
                  style={{ width: w, height: rowH }}
                  onClick={() => onVideoClick(img.youtubeId!)}>

                  {/* YT thumbnail – next/Image */}
                  <Image
                    src={`https://i.ytimg.com/vi/${img.youtubeId}/maxresdefault.jpg`}
                    alt={img.alt}
                    fill
                    sizes={`${w}px`}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized // külső domain, next.js nem optimalizálja (hacsak nincs remotePatterns)
                  />
                  <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors duration-300"/>

                  {/* Play gomb */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full border border-white/60 bg-white/10 backdrop-blur-sm
                      flex items-center justify-center transition-all duration-300
                      group-hover:scale-110 group-hover:bg-white/20"
                      style={{ width: rowH * 0.25, height: rowH * 0.25 }}>
                      <svg viewBox="0 0 24 24" fill="white"
                        style={{ width: rowH * 0.1, height: rowH * 0.1, marginLeft: rowH * 0.02 }}>
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </div>
                  </div>

                  {/* YT badge */}
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 flex items-center justify-end"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
                    <div className="flex items-center bg-red-600 px-1 py-0.5">
                      <svg viewBox="0 0 24 24" fill="white" style={{ width: rowH * 0.07, height: rowH * 0.07 }}>
                        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8z"/>
                        <polygon fill="white" points="9.5 15.6 15.8 12 9.5 8.4 9.5 15.6"/>
                      </svg>
                    </div>
                  </div>
                </div>
              );
            }

            // ── Sima kép – next/Image ──────────────────────────
            return (
              <div key={j}
                className="relative overflow-hidden group flex-shrink-0"
                style={{ width: w, height: rowH }}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  // sizes: pontosan akkora mint a cella → Next.js a megfelelő felbontásút tölti
                  sizes={`${w}px`}
                  quality={85}
                  priority={priority && j === 0} // csak az első slide első képe priority
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${accent}22, transparent 60%)` }}/>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
});

// ── DesktopSlide – memo ───────────────────────────────────────
const DesktopSlide = memo(function DesktopSlide({
  slide, onVideoClick, rowH, rowGap, maxW, isFirst,
}: {
  slide: (typeof slides)[0];
  onVideoClick: (id: string) => void;
  rowH: number;
  rowGap: number;
  maxW: number;
  isFirst: boolean;
}) {
  const isDark = slide.theme === "dark";

  return (
    <div className="relative flex-shrink-0 w-screen h-screen overflow-hidden flex"
      style={{ backgroundColor: slide.bg }}>

      {/* Dekoratív szám */}
      <div className="absolute pointer-events-none select-none font-['Cormorant_Garamond'] font-light z-0"
        style={{ fontSize: "28vw", color: isDark ? "rgba(200,168,130,0.025)" : "rgba(200,168,130,0.05)", lineHeight: 1, bottom: "-2vw", left: "-1vw" }}>
        {slide.number}
      </div>

      {/* BAL: szöveg (38%) */}
      <div className="relative z-10 flex flex-col justify-center px-[5vw] xl:px-[6vw]"
        style={{ width: "38%", flexShrink: 0 }}>

        <div className="flex items-center gap-[1.5vw] mb-[3vh]">
          <div className="h-px" style={{ width: "2.2vw", background: slide.accent }}/>
          <span className="tracking-[0.28em] uppercase"
            style={{ fontSize: "clamp(8px,0.6vw,11px)", color: slide.accent }}>
            {slide.number} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>

        <h2 className={`font-['Cormorant_Garamond'] font-light leading-[0.88] tracking-tighter mb-[1.5vh] ${isDark ? "text-white" : "text-[#1A1510]"}`}
          style={{ fontSize: "clamp(3rem, 5vw, 7.5rem)" }}>
          {slide.title}
        </h2>

        <p className={`font-['Cormorant_Garamond'] font-light italic mb-[2.5vh] ${isDark ? "text-white/40" : "text-[#A08060]"}`}
          style={{ fontSize: "clamp(0.85rem, 1.05vw, 1.35rem)" }}>
          {slide.subtitle}
        </p>

        <p className={`font-light leading-relaxed mb-[2.5vh] max-w-[32ch] ${isDark ? "text-white/55" : "text-[#7A6A58]"}`}
          style={{ fontSize: "clamp(11px, 0.82vw, 14px)" }}>
          {slide.description}
        </p>

        <div className="flex flex-wrap gap-[0.5vw] mb-[3vh]">
          {slide.tags.map(tag => (
            <span key={tag} className="tracking-widest uppercase px-[0.9vw] py-[0.5vh] border rounded-full"
              style={{ fontSize: "clamp(7px,0.52vw,9px)", color: slide.accent, borderColor: `${slide.accent}35` }}>
              {tag}
            </span>
          ))}
        </div>

        <div className={`flex items-center justify-between pt-[2vh] border-t ${isDark ? "border-white/10" : "border-black/6"}`}>
          <div>
            <div className="font-['Cormorant_Garamond'] font-light leading-none"
              style={{ fontSize: "clamp(1.8rem,2.4vw,3.2rem)", color: slide.accent }}>
              {slide.stat.n}
            </div>
            <div className={`tracking-widest uppercase opacity-50 mt-[0.5vh] ${isDark ? "text-white" : "text-black"}`}
              style={{ fontSize: "clamp(7px,0.52vw,9px)" }}>
              {slide.stat.l}
            </div>
          </div>
          <Link href={slide.href}
            className={`group flex items-center gap-[0.8vw] tracking-widest uppercase transition-all ${isDark ? "text-white/60 hover:text-white" : "text-[#1A1510]/60 hover:text-[#1A1510]"}`}
            style={{ fontSize: "clamp(8px,0.58vw,10px)" }}>
            <span>Részletek</span>
            <div className="h-px bg-current transition-all duration-300 group-hover:w-[2.5vw]" style={{ width: "1.4vw" }}/>
          </Link>
        </div>
      </div>

      {/* Elválasztó */}
      <div className="absolute z-20 top-[8vh] bottom-[8vh] w-px" style={{
        left: "38%",
        background: isDark
          ? "linear-gradient(to bottom, transparent, rgba(200,168,130,0.12), transparent)"
          : "linear-gradient(to bottom, transparent, rgba(200,168,130,0.22), transparent)",
      }}/>

      {/* JOBB: galéria (62%) */}
      <div className="relative z-10 flex-1 flex items-center py-[5vh] pr-[6vw] pl-[2.5vw]">
        <JustifiedGallery
          images={slide.images}
          accent={slide.accent}
          onVideoClick={onVideoClick}
          rowH={rowH}
          rowGap={rowGap}
          maxW={maxW}
          priority={isFirst}
        />
      </div>
    </div>
  );
});

// ── DesktopScroll ─────────────────────────────────────────────
// VW STATE EGY HELYEN – debounce-olva, nem minden resize ticknél

function DesktopScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
 
  // ✅ Mindig 1440-ről indul → SSR és kliens első render egyezik → nincs hydration error
  // ✅ useEffect-ben (mount után) frissül a valós viewport szélességre
  const [vw, setVw] = useState(1440);
 
  useEffect(() => {
    // Azonnal frissítjük a valós értékre mountolás után
    setVw(window.innerWidth);
 
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setVw(window.innerWidth), 150);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
    };
  }, []);
 
  const rowH   = (ROW_H_VW   / 100) * vw;
  const rowGap = (ROW_GAP_VW / 100) * vw;
  const maxW   = (MAX_ROW_VW / 100) * vw;
 
  const handleVideoClick = useCallback((id: string) => setActiveVideo(id), []);
 
  useEffect(() => {
    let ctx: any, mounted = true;
    async function init() {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!mounted) return;
      ScrollTrigger.getAll().forEach(t => t.kill());
      await new Promise(r => setTimeout(r, 80));
      if (!mounted) return;
 
      ctx = gsap.context(() => {
        const track   = trackRef.current;
        const section = sectionRef.current;
        if (!track || !section) return;
 
        gsap.set(track, { x: 0, force3D: true });
        const getTotal = () => track.scrollWidth - window.innerWidth;
 
        gsap.to(track, {
          x: () => -getTotal(),
          ease: "none",
          scrollTrigger: {
            trigger:    section,
            start:      "top top",
            end:        () => `+=${getTotal()}`,
            scrub:      true,
            pin:        true,
            pinSpacing: true,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
          },
        });
 
        gsap.to(".hs-progress-bar", {
          scaleX: 1, ease: "none",
          scrollTrigger: {
            trigger: section, start: "top top",
            end: () => `+=${getTotal()}`, scrub: true,
          },
        });
 
        ScrollTrigger.create({
          trigger: section, start: "top top",
          end: () => `+=${getTotal()}`,
          onUpdate: self => {
            const cur = Math.min(Math.ceil(self.progress * slides.length) || 1, slides.length);
            const el  = document.querySelector(".hs-counter-current");
            if (el) el.textContent = String(cur).padStart(2, "0");
          },
        });
      }, sectionRef);
    }
    init();
    return () => { mounted = false; ctx?.revert(); };
  }, []);
 
  return (
    <>
      <section ref={sectionRef} className="relative w-full h-screen" style={{ overflow: "hidden" }}>
        <div className="absolute right-[2vw] top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3 pointer-events-none mix-blend-difference">
          <span className="hs-counter-current font-['Cormorant_Garamond'] font-light text-white tabular-nums"
            style={{ fontSize: "clamp(1.4rem,2vw,2.6rem)" }}>01</span>
          <div className="w-px bg-white/30" style={{ height: "5vh" }}/>
          <span className="font-['Cormorant_Garamond'] font-light text-white/40"
            style={{ fontSize: "clamp(0.9rem,1.3vw,1.6rem)" }}>
            {String(slides.length).padStart(2, "0")}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/5 z-30">
          <div className="hs-progress-bar h-full bg-[#C8A882] origin-left scale-x-0"/>
        </div>
        <div ref={trackRef} className="flex h-full"
          style={{ willChange: "transform", transform: "translate3d(0,0,0)", backfaceVisibility: "hidden" }}>
          {slides.map((slide, i) => (
            <DesktopSlide
              key={slide.id}
              slide={slide}
              onVideoClick={handleVideoClick}
              rowH={rowH}
              rowGap={rowGap}
              maxW={maxW}
              isFirst={i === 0}
            />
          ))}
        </div>
      </section>
      {activeVideo && <VideoModal videoId={activeVideo} onClose={() => setActiveVideo(null)}/>}
    </>
  );
}


// ── Mobil ─────────────────────────────────────────────────────
const MOBILE_ROW_H   = 105;
const MOBILE_ROW_GAP = 4;
const MOBILE_MAX_W   = 320;

function MobileSlides() {
  const [videoId, setVideoId]   = useState<string | null>(null);
  const handleVideoClick = useCallback((id: string) => setVideoId(id), []);

  return (
    <>
      <div className="lg:hidden flex flex-col">
        {slides.map((slide, i) => {
          const isDark = slide.theme === "dark";
          return (
            <div key={slide.id} className="relative overflow-hidden py-12 px-5"
              style={{ backgroundColor: slide.bg }}>

              {/* Dekoratív szám */}
              <div className="absolute pointer-events-none select-none font-['Cormorant_Garamond'] font-light"
                style={{ fontSize: "8rem", color: isDark ? "rgba(200,168,130,0.05)" : "rgba(200,168,130,0.08)", lineHeight: 0.9, bottom: "-0.5rem", right: "0.5rem" }}>
                {slide.number}
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-5 h-px" style={{ background: slide.accent }}/>
                  <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: slide.accent }}>
                    {slide.number} / {String(slides.length).padStart(2, "0")}
                  </span>
                </div>

                <h2 className={`font-['Cormorant_Garamond'] font-light leading-[0.95] tracking-tighter mb-2 ${isDark ? "text-white" : "text-[#1A1510]"}`}
                  style={{ fontSize: "clamp(2rem,10vw,3.2rem)" }}>
                  {slide.title}
                </h2>

                <p className={`font-['Cormorant_Garamond'] text-[0.9rem] font-light italic mb-3 ${isDark ? "text-white/40" : "text-[#A08060]"}`}>
                  {slide.subtitle}
                </p>

                <p className={`text-[13px] font-light leading-relaxed mb-5 ${isDark ? "text-white/60" : "text-[#7A6A58]"}`}>
                  {slide.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {slide.tags.map(tag => (
                    <span key={tag} className="text-[9px] tracking-widest uppercase px-3 py-1 border rounded-full"
                      style={{ color: slide.accent, borderColor: `${slide.accent}40` }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Galéria – vízszintesen scrollozható */}
                <div className="overflow-x-auto pb-2 -mx-5 px-5"
                  style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
                  <JustifiedGallery
                    images={slide.images}
                    accent={slide.accent}
                    onVideoClick={handleVideoClick}
                    rowH={MOBILE_ROW_H}
                    rowGap={MOBILE_ROW_GAP}
                    maxW={MOBILE_MAX_W}
                    priority={i === 0}
                  />
                </div>

                <div className={`flex items-center justify-between pt-5 mt-4 border-t ${isDark ? "border-white/10" : "border-black/5"}`}>
                  <div>
                    <div className="font-['Cormorant_Garamond'] text-[2.2rem] font-light"
                      style={{ color: slide.accent }}>{slide.stat.n}</div>
                    <div className={`text-[8px] tracking-widest uppercase opacity-50 ${isDark ? "text-white" : "text-black"}`}>
                      {slide.stat.l}
                    </div>
                  </div>
                  <Link href={slide.href}
                    className={`flex items-center gap-2 text-[10px] tracking-widest uppercase border-b pb-0.5 ${isDark ? "text-white/70 border-white/20" : "text-[#1A1510]/70 border-[#1A1510]/20"}`}>
                    Részletek
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {videoId && <VideoModal videoId={videoId} onClose={() => setVideoId(null)}/>}
    </>
  );
}

export default function HorizontalScrollSection() {
  return (
    <main className="bg-white">
      <div className="hidden lg:block"><DesktopScroll/></div>
      <MobileSlides/>
    </main>
  );
}