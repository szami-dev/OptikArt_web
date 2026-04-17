"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ── Galéria méret konstansok ──────────────────────────────────
// vw-alapú → arányosan skálázódik 1080p, 1440p, 4K-n egyaránt
//
// Logika: a jobb panel = 62% * 100vw - paddingok (≈ 5vw jobb + 2.5vw bal + 2vw számláló)
// Elérhető szélesség ≈ 62vw - 9.5vw = 52.5vw
// ROW_H: 1080p-n ~180px, 1440p-n ~240px, 4K-n ~480px → arányos
const ROW_H_VW    = 16;   // vw – egy sor magassága
const ROW_GAP_VW  = 0.4;  // vw – képek és sorok közti rés
const MAX_ROW_VW  = 52;   // vw – egy sor max szélessége

const slides = [
  {
    id: "eskuvo", number: "01", title: "Esküvő",
    subtitle: "A ti történetetek, örökre.",
    description: "Professzionális esküvői fotózás és videózás, amely megőrzi a nagy nap minden pillanatát — természetes, időtlen stílusban.",
    href: "/wedding", tags: ["Fotózás", "Videózás", "Highlight film"],
    theme: "light" as const, bg: "#FAF8F4", accent: "#C8A882",
    images: [
      { type: "image" as const, src: "/gallery/wedding/arankatibor-15.JPG",  alt: "Pár",         aspect: 3/2 },
      { type: "image" as const, src: "/gallery/wedding/keszulodes-90.JPG",   alt: "Menyasszony", aspect: 2/3 },
      { type: "video" as const, src: "/gallery/wedding/kreativ-97.JPG",      alt: "Film",        aspect: 3/2, youtubeId: "3sQo_md2CqI", label: "Highlight film" },
      { type: "image" as const, src: "/gallery/wedding/vanizoli-210.jpg",    alt: "Gyűrűk",      aspect: 2/3 },
      
      
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
      { type: "image" as const, src: "/gallery/portrait/napraforgo-27.JPG",       alt: "Portré",  aspect: 2/3 },
      { type: "image" as const, src: "/assets/zugiviki-15.JPG",                   alt: "Portré2", aspect: 2/3 },
      { type: "image" as const, src: "/gallery/portrait/marcidorina-76 (1).JPG",  alt: "Páros",   aspect: 3/2 },
      { type: "image" as const, src: "/gallery/portrait/amiraek-91.jpg",          alt: "Família", aspect: 3/2 },
      { type: "image" as const, src: "/gallery/portrait/napraforgo-27.JPG",       alt: "Port3",   aspect: 2/3 },
      { type: "image" as const, src: "/gallery/portrait/SzaboReka-1_pp_pp.jpg",   alt: "Egyéni",  aspect: 2/3 },
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
      { type: "video" as const, src: "/gallery/event/borfesztUTSO-140.JPG", alt: "Event",     aspect: 3/2, youtubeId: "LbDrYcfLCRE", label: "Event reel" },
      { type: "image" as const, src: "/gallery/event/borfesztUTSO-106.JPG", alt: "Tömeg",     aspect: 3/2 },
      { type: "image" as const, src: "/gallery/event/borfesztUTSO-190.JPG", alt: "Kurultáj",  aspect: 2/3 },
      { type: "image" as const, src: "/gallery/event/ballagaspg-192.JPG",   alt: "Ballagás2", aspect: 2/3 },
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
      { type: "image" as const, src: "/gallery/marketing/siriusjanuar-28.JPG",   alt: "Termék",     aspect: 3/2  },
      { type: "video" as const, src: "/gallery/marketing/siriusMarcius-6.JPG",   alt: "Brand",      aspect: 9/16, youtubeId: "EnHDwBumuqY", label: "Brand film" },
      { type: "image" as const, src: "/gallery/marketing/bippu-35.JPG",          alt: "Brand2",     aspect: 3/2  },
      { type: "image" as const, src: "/gallery/marketing/pellikanmarcius-4.JPG", alt: "Influencer", aspect: 2/3  },
      { type: "video" as const, src: "/gallery/marketing/siriusjanuar-28.JPG",   alt: "Termék2",    aspect: 9/16, youtubeId: "oGcB8-IUlj8", label: "Termékfotó" },
     
    ],
    stat: { n: "500+", l: "Poszt/hó" },
  },
  {
    id: "dron", number: "05", title: "Drón",
    subtitle: "A világ felülnézetből egészen más.",
    description: "Légifotók és videók — engedéllyel, profi felszereléssel, 6K felbontásban.",
    href: "/drone", tags: ["Légifotó", "6K videó", "Engedéllyel"],
    theme: "dark" as const, bg: "#0C0A08", accent: "#C8A882",
    images: [
      { type: "image" as const, src: "/gallery/drone/alfold-63 másolata.JPG", alt: "Táj 1", aspect: 3/2 },
      { type: "image" as const, src: "/gallery/drone/alfold-65 másolata.JPG", alt: "Táj 2", aspect: 3/2 },
      { type: "video" as const, src: "/gallery/drone/alfold-64 másolata.JPG", alt: "Drón",  aspect: 3/2, youtubeId: "dQw4w9WgXcQ", label: "Drón showreel" },
      { type: "image" as const, src: "/gallery/drone/alfold-63 másolata.JPG", alt: "Táj 3", aspect: 3/2 },
      { type: "image" as const, src: "/gallery/drone/alfold-65 másolata.JPG", alt: "Táj 4", aspect: 2/3 },
    ],
    stat: { n: "6K", l: "Felbontás" },
  },
];

type SlideImage = (typeof slides)[0]["images"][0];

// ── Sortörés – vw alapú ───────────────────────────────────────
// A képszélességet és a max sor szélességet vw-ban számítjuk,
// majd window.innerWidth-szal konvertáljuk px-be a buildRows-ban.
// SSR alatt (window nincs) fallback: 1440px viewport feltételezve.
function buildRows(images: SlideImage[], viewportW: number): SlideImage[][] {
  const rowH   = (ROW_H_VW   / 100) * viewportW;
  const rowGap = (ROW_GAP_VW / 100) * viewportW;
  const maxW   = (MAX_ROW_VW / 100) * viewportW;

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
function JustifiedGallery({ images, accent, onVideoClick }: {
  images: SlideImage[];
  accent: string;
  onVideoClick: (id: string) => void;
}) {
  const [vw, setVw] = useState(1440);

  useEffect(() => {
    setVw(window.innerWidth);
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const rowH   = (ROW_H_VW   / 100) * vw;
  const rowGap = (ROW_GAP_VW / 100) * vw;
  const rows   = buildRows(images, vw);

  function renderCell(img: SlideImage, j: number) {
    const w = rowH * img.aspect;

    if (img.type === "video" && img.youtubeId) {
      return (
        <div key={j}
          className="relative overflow-hidden cursor-pointer group flex-shrink-0"
          style={{ width: w, height: rowH }}
          onClick={() => onVideoClick(img.youtubeId!)}>
          <img
            src={`https://i.ytimg.com/vi/${img.youtubeId}/maxresdefault.jpg`}
            alt={img.alt}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => { (e.target as HTMLImageElement).src = img.src; }}
          />
          <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors duration-300"/>
          {/* Play */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="rounded-full border border-white/60 bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20"
              style={{ width: rowH * 0.25, height: rowH * 0.25 }}>
              <svg viewBox="0 0 24 24" fill="white"
                style={{ width: rowH * 0.1, height: rowH * 0.1, marginLeft: rowH * 0.02 }}>
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
          </div>
          {/* Label */}
          <div className="absolute bottom-0 left-0 right-0 px-2 py-1"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: rowH * 0.07, letterSpacing: "0.1em" }}
                className="uppercase text-white/80">
                {img.label}
              </span>
              <div className="flex items-center bg-red-600 px-1 py-0.5">
                <svg viewBox="0 0 24 24" fill="white" style={{ width: rowH * 0.07, height: rowH * 0.07 }}>
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8z"/>
                  <polygon fill="white" points="9.5 15.6 15.8 12 9.5 8.4 9.5 15.6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={j}
        className="relative overflow-hidden group flex-shrink-0"
        style={{ width: w, height: rowH }}>
        <img
          src={img.src} alt={img.alt} loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(135deg, ${accent}22, transparent 60%)` }}/>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: rowGap }}>
      {rows.map((row, i) => (
        <div key={i} className="flex items-stretch" style={{ gap: rowGap }}>
          {row.map((img, j) => renderCell(img, j))}
        </div>
      ))}
    </div>
  );
}

// ── DesktopSlide ──────────────────────────────────────────────
function DesktopSlide({ slide, onVideoClick }: {
  slide: (typeof slides)[0];
  onVideoClick: (id: string) => void;
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

      {/* ── BAL: szöveg (38%) ── */}
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

      {/* ── JOBB: justified gallery (62%), vertikálisan középre ── */}
      <div className="relative z-10 flex-1 flex items-center py-[5vh] pr-[6vw] pl-[2.5vw]">
        <JustifiedGallery images={slide.images} accent={slide.accent} onVideoClick={onVideoClick}/>
      </div>
    </div>
  );
}

// ── DesktopScroll ─────────────────────────────────────────────
function DesktopScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    let ctx: any, mounted = true;
    async function init() {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!mounted) return;
      ScrollTrigger.getAll().forEach(t => t.kill());
      await new Promise(r => setTimeout(r, 60));
      if (!mounted) return;
      ctx = gsap.context(() => {
        const track = trackRef.current, section = sectionRef.current;
        if (!track || !section) return;
        const getTotal = () => track.scrollWidth - window.innerWidth;
        gsap.set(track, { x: 0 });
        gsap.to(track, {
          x: () => -getTotal(), ease: "none",
          scrollTrigger: { trigger: section, start: "top top", end: () => `+=${getTotal()}`, scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true },
        });
        gsap.to(".hs-progress-bar", {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: section, start: "top top", end: () => `+=${getTotal()}`, scrub: true },
        });
        ScrollTrigger.create({
          trigger: section, start: "top top", end: () => `+=${getTotal()}`,
          onUpdate: self => {
            const cur = Math.min(Math.ceil(self.progress * slides.length) || 1, slides.length);
            const el = document.querySelector(".hs-counter-current");
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
      <section ref={sectionRef} className="relative w-full overflow-hidden h-screen">
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
        <div ref={trackRef} className="flex h-full will-change-transform">
          {slides.map((slide, i) => (
            <DesktopSlide key={i} slide={slide} onVideoClick={setActiveVideo}/>
          ))}
        </div>
      </section>
      {activeVideo && <VideoModal videoId={activeVideo} onClose={() => setActiveVideo(null)}/>}
    </>
  );
}

// ── Mobil ─────────────────────────────────────────────────────
function MobileSlides() {
  const [videoId, setVideoId] = useState<string | null>(null);
  return (
    <>
      <div className="lg:hidden flex flex-col">
        {slides.map((slide, i) => {
          const isDark = slide.theme === "dark";
          return (
            <div key={i} className="relative overflow-hidden py-14 px-5" style={{ backgroundColor: slide.bg }}>
              <div className="absolute pointer-events-none select-none font-['Cormorant_Garamond'] font-light"
                style={{ fontSize: "9rem", color: isDark ? "rgba(200,168,130,0.05)" : "rgba(200,168,130,0.08)", lineHeight: 0.9, bottom: "-0.5rem", right: "0.75rem" }}>
                {slide.number}
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-5 h-px" style={{ background: slide.accent }}/>
                  <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: slide.accent }}>
                    {slide.number} / {String(slides.length).padStart(2, "0")}
                  </span>
                </div>
                <h2 className={`font-['Cormorant_Garamond'] font-light leading-[0.95] tracking-tighter mb-2 ${isDark ? "text-white" : "text-[#1A1510]"}`}
                  style={{ fontSize: "clamp(2.2rem,9vw,3.5rem)" }}>
                  {slide.title}
                </h2>
                <p className={`font-['Cormorant_Garamond'] text-[0.95rem] font-light italic mb-3 ${isDark ? "text-white/40" : "text-[#A08060]"}`}>
                  {slide.subtitle}
                </p>
                <p className={`text-[13px] font-light leading-relaxed mb-5 ${isDark ? "text-white/60" : "text-[#7A6A58]"}`}>
                  {slide.description}
                </p>
                <div className="mb-5 overflow-x-auto pb-1 -mx-5 px-5">
                  <JustifiedGallery images={slide.images} accent={slide.accent} onVideoClick={setVideoId}/>
                </div>
                <div className={`flex items-center justify-between pt-5 border-t ${isDark ? "border-white/10" : "border-black/5"}`}>
                  <div>
                    <div className="font-['Cormorant_Garamond'] text-[2.5rem] font-light" style={{ color: slide.accent }}>{slide.stat.n}</div>
                    <div className="text-[8px] tracking-widest uppercase opacity-50">{slide.stat.l}</div>
                  </div>
                  <Link href={slide.href} className={`text-[10px] tracking-widest uppercase border-b pb-0.5 ${isDark ? "text-white/60 border-white/20" : "text-[#1A1510]/70 border-[#1A1510]/20"}`}>
                    Részletek →
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