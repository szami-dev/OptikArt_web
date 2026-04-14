"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ── Adatok ────────────────────────────────────────────────────
const slides = [
  {
    id: "eskuvo",
    number: "01",
    title: "Esküvő",
    subtitle: "A ti történetetek, örökre.",
    description:
      "Professzionális esküvői fotózás és videózás, amely megőrzi a nagy nap minden pillanatát — természetes, időtlen stílusban.",
    href: "/wedding",
    tags: ["Fotózás", "Videózás", "Highlight film"],
    theme: "light" as const,
    bg: "#FAF8F4",
    accent: "#C8A882",
    images: [
      {
        type: "image" as const,
        src: "/gallery/wedding/arankatibor-15.JPG",
        alt: "Esküvői pár",
        aspect: 3 / 2,
      },
      {
        type: "image" as const,
        src: "/gallery/wedding/keszulodes-90.JPG",
        alt: "Menyasszony",
        aspect: 3 / 2,
      },
      {
        type: "video" as const,
        src: "/gallery/wedding/kreativ-97.JPG",
        alt: "Esküvői film",
        aspect: 3 / 2,
        youtubeId: "3sQo_md2CqI",
        label: "Highlight film",
      },

      {
        type: "image" as const,
        src: "/gallery/wedding/vanizoli-210.jpg",
        alt: "Gyűrűk",
        aspect: 2 / 3,
      },
    ],
    stat: { n: "120+", l: "Esküvő" },
  },
  {
    id: "portre",
    number: "02",
    title: "Portré",
    subtitle: "Pillantások — arcok, pillanatok, emlékek.",
    description:
      "Páros, jegyes, családi és egyéni portré fotózás. Természetes fényben, valódi pillanatokból — mert minden arc mesél valamit.",
    href: "/portrait",
    tags: ["Páros", "Családi", "Egyéni portré"],
    theme: "light" as const,
    bg: "#FFFFFF",
    accent: "#C8A882",
    images: [
      {
        type: "image" as const,
        src: "/gallery/portrait/napraforgo-27.JPG",
        alt: "Nő portré",
        aspect: 2 / 3,
      },
      {
        type: "image" as const,
        src: "/assets/zugiviki-15.JPG",
        alt: "Portré",
        aspect: 2 / 3,
      },
      {
        type: "image" as const,
        src: "/gallery/portrait/SzaboReka-1_pp_pp.jpg",
        alt: "Páros film",
        aspect: 2 / 3,
        label: "Páros portré film",
      },
      {
        type: "image" as const,
        src: "/gallery/portrait/marcidorina-76 (1).JPG",
        alt: "Páros",
        aspect: 3 / 2,
      },
      {
        type: "image" as const,
        src: "/gallery/portrait/amiraek-91.jpg",
        alt: "Família",
        aspect: 3 / 2,
      },
    ],
    stat: { n: "350+", l: "Portré" },
  },
  {
    id: "rendezvenyek",
    number: "03",
    title: "Rendezvény",
    subtitle: "Minden pillanat számít.",
    description:
      "Céges rendezvény, fesztivál, party vagy konferencia — mi ott vagyunk és megörökítjük az energiát. Gyors, precíz, profi.",
    href: "/event",
    tags: ["Céges", "Fesztivál", "Magán"],
    theme: "dark" as const,
    bg: "#1A1410",
    accent: "#C8A882",
    images: [
      {
        type: "image" as const,
        src: "/gallery/event/ballagaspg-192.JPG",
        alt: "Ballagás",
        aspect: 3 / 2,
      },
      {
        type: "video" as const,
        src: "/gallery/event/borfesztUTSO-140.JPG",
        alt: "Rendezvény reel",
        aspect: 3 / 2,
        youtubeId: "LbDrYcfLCRE",
        label: "Event reel",
      },
      {
        type: "image" as const,
        src: "/gallery/event/borfesztUTSO-106.JPG",
        alt: "Tömeg",
        aspect: 3 / 2,
      },
      {
        type: "image" as const,
        src: "/gallery/event/borfesztUTSO-190.JPG",
        alt: "Kurultáj",
        aspect: 3 / 2,
      },
    ],
    stat: { n: "80+", l: "Rendezvény" },
  },
  {
    id: "marketing",
    number: "04",
    title: "Marketing",
    subtitle: "Content, ami megállít.",
    description:
      "Professzionális fotó és short-form videó tartalom — Instagram, TikTok, Facebook. Amit az algoritmus szeret és az emberek megnéznek.",
    href: "/marketing",
    tags: ["Instagram", "TikTok", "Brand film"],
    theme: "light" as const,
    bg: "#FAF8F4",
    accent: "#1A1510",
    images: [
      {
        type: "image" as const,
        src: "/gallery/marketing/siriusjanuar-28.JPG",
        alt: "Termékfotó",
        aspect: 3 / 2,
      },
      {
        type: "video" as const,
        src: "/gallery/marketing/siriusMarcius-6.JPG",
        alt: "Brand film",
        aspect: 9 / 16,
        youtubeId: "EnHDwBumuqY",
        label: "Brand film",
      },
      {
        type: "image" as const,
        src: "/gallery/marketing/bippu-35.JPG",
        alt: "Brand videó",
        aspect: 3 / 2,
      },
      {
        type: "image" as const,
        src: "/gallery/marketing/pellikanmarcius-4.JPG",
        alt: "Influencer",
        aspect: 3 / 2,
      },
      {
        type: "video" as const,
        src: "/gallery/marketing/siriusjanuar-28.JPG",
        alt: "Termékfotó",
        aspect: 9 / 16,
        youtubeId: "oGcB8-IUlj8",
        label: "Termékfotó",
      },
    ],
    stat: { n: "500+", l: "Poszt/hó" },
  },
  {
    id: "dron",
    number: "05",
    title: "Drón",
    subtitle: "A világ felülnézetből egészen más.",
    description:
      "Légifotók és videók, amelyek új perspektívát adnak — engedéllyel, profi felszereléssel, 6K felbontásban.",
    href: "/drone",
    tags: ["Légifotó", "6K videó", "Engedéllyel"],
    theme: "dark" as const,
    bg: "#0C0A08",
    accent: "#C8A882",
    images: [
      {
        type: "image" as const,
        src: "/gallery/drone/alfold-63 másolata.JPG",
        alt: "Táj légifotó",
        aspect: 3 / 2,
      },
      {
        type: "video" as const,
        src: "/gallery/drone/alfold-64 másolata.JPG",
        alt: "Drón showreel",
        aspect: 3 / 2,
        youtubeId: "dQw4w9WgXcQ",
        label: "Drón showreel",
      },
      {
        type: "image" as const,
        src: "/gallery/drone/alfold-65 másolata.JPG",
        alt: "Absztrakt táj",
        aspect: 3 / 2,
      },
    ],
    stat: { n: "6K", l: "Felbontás" },
  },
];

// ── Videó modal ───────────────────────────────────────────────
function VideoModal({
  videoId,
  onClose,
}: {
  videoId: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[400] bg-black/96 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl"
        style={{ aspectRatio: "16/9" }}
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title="Videó"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
      <button
        className="absolute top-4 right-4 text-white/50 hover:text-white p-2 transition-colors"
        onClick={onClose}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-8 h-8"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ── Desktop slide ─────────────────────────────────────────────
// Kulcs döntés: a szövegblokk és képsor magassága EXPLICIT, nem flex-1.
// Szöveg: ~45% vh, Képek: ~38% vh → összesen ~83% vh + paddingok ≈ 100vh

function DesktopSlide({ slide }: { slide: (typeof slides)[0] }) {
  const isDark = slide.theme === "dark";
  const [videoId, setVideoId] = useState<string | null>(null);

  return (
    <>
      <div
        className="relative flex-shrink-0 w-screen h-screen overflow-hidden flex flex-col"
        style={{ backgroundColor: slide.bg }}
      >
        {/* Háttér szám */}
        <div
          className="absolute pointer-events-none select-none font-['Cormorant_Garamond'] font-light z-0"
          style={{
            fontSize: "28vw",
            color: isDark ? "rgba(200,168,130,0.03)" : "rgba(200,168,130,0.06)",
            lineHeight: 1,
            bottom: "-3rem",
            right: "2rem",
          }}
        >
          {slide.number}
        </div>

        {/* ── Szöveg szekció: fix magasság, nem nyújtódik ── */}
        <div className="relative z-10 flex-shrink-0 grid grid-cols-12 gap-8 xl:gap-14 px-14 xl:px-20 pt-12 xl:pt-16 pb-8">
          {/* Bal: cím */}
          <div className="col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-px" style={{ background: slide.accent }} />
              <span
                className="text-[10px] tracking-[0.28em] uppercase"
                style={{ color: slide.accent }}
              >
                {slide.number} / {String(slides.length).padStart(2, "0")}
              </span>
            </div>
            <h2
              className={`font-['Cormorant_Garamond'] font-light leading-[0.9] tracking-tighter mb-3 ${isDark ? "text-white" : "text-[#1A1510]"}`}
              style={{ fontSize: "clamp(3.5rem, 6vw, 7rem)" }}
            >
              {slide.title}
            </h2>
            <p
              className={`font-['Cormorant_Garamond'] text-[1.1rem] xl:text-[1.25rem] font-light italic ${isDark ? "text-white/40" : "text-[#A08060]"}`}
            >
              {slide.subtitle}
            </p>
          </div>

          {/* Jobb: leírás + tagek + stat */}
          <div className="col-span-6 col-start-7 flex flex-col justify-end">
            <p
              className={`text-[13px] font-light leading-relaxed mb-4 max-w-sm ${isDark ? "text-white/60" : "text-[#7A6A58]"}`}
            >
              {slide.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {slide.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] tracking-widest uppercase px-3 py-1.5 border rounded-full"
                  style={{
                    color: slide.accent,
                    borderColor: `${slide.accent}35`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div
              className={`flex items-center justify-between pt-4 border-t ${isDark ? "border-white/10" : "border-black/6"}`}
            >
              <div>
                <div
                  className="font-['Cormorant_Garamond'] text-[2.4rem] font-light"
                  style={{ color: slide.accent }}
                >
                  {slide.stat.n}
                </div>
                <div
                  className={`text-[9px] tracking-widest uppercase opacity-50 mt-0.5 ${isDark ? "text-white" : "text-black"}`}
                >
                  {slide.stat.l}
                </div>
              </div>
              <Link
                href={slide.href}
                className={`group flex items-center gap-3 text-[11px] tracking-widest uppercase transition-all ${isDark ? "text-white/70 hover:text-white" : "text-[#1A1510]/70 hover:text-[#1A1510]"}`}
              >
                <span>Részletek</span>
                <div className="w-6 h-px bg-current transition-all duration-300 group-hover:w-10" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Képsor: fix magasság, alulra igazítva ── */}
        {/* 
          FIX: A képek nem flex-1-ben vannak hanem explicit h-[38vh] konténerben.
          Így GSAP pin alatt is pontosan 38vh helyet foglalnak, nem folynak szét.
          px-14 = ugyanaz a padding mint a szövegnél → bal szélen szépen zárul.
        */}
        <div className="relative z-10 flex-shrink-0 mt-auto px-14 xl:px-20 pb-10 xl:pb-12">
          <div
            className="flex gap-3 xl:gap-4 items-end"
            style={{ height: "clamp(170px, 34vh, 260px)" }}
          >
            {slide.images.map((img, j) => {
              // width = height * aspect
              const style = {
                height: "100%",
                width: `calc(clamp(170px, 34vh, 260px) * ${img.aspect})`,
                flexShrink: 0,
              };

              if (img.type === "video") {
                return (
                  <div
                    key={j}
                    style={style}
                    className="relative overflow-hidden cursor-pointer group"
                    onClick={() => setVideoId(img.youtubeId)}
                  >
                    {/* YT thumbnail */}
                    <img
                      src={`https://i.ytimg.com/vi/${img.youtubeId}/maxresdefault.jpg`}
                      alt={img.alt}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = img.src;
                      }}
                    />
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors duration-300" />
                    {/* Play gomb */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20"
                        style={{
                          borderColor: `${slide.accent}80`,
                          background: `${slide.accent}18`,
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="white"
                          className="w-4 h-4 ml-0.5"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </div>
                    {/* Label */}
                    <div
                      className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
                      }}
                    >
                      <span className="text-[8px] tracking-[0.14em] uppercase text-white/80">
                        {img.label}
                      </span>
                      <div className="flex items-center gap-1 bg-red-600 px-1.5 py-0.5">
                        <svg
                          viewBox="0 0 24 24"
                          fill="white"
                          className="w-2.5 h-2.5"
                        >
                          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8z" />
                          <polygon
                            fill="white"
                            points="9.5 15.6 15.8 12 9.5 8.4 9.5 15.6"
                          />
                        </svg>
                        <span className="text-[7px] text-white tracking-wider">
                          YT
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Image
              return (
                <div
                  key={j}
                  style={style}
                  className="relative overflow-hidden group"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    quality={85}
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.06]"
                    sizes="400px"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    style={{
                      background: `linear-gradient(to top, ${slide.accent}55, transparent 60%)`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {videoId && (
        <VideoModal videoId={videoId} onClose={() => setVideoId(null)} />
      )}
    </>
  );
}

// ── Desktop wrapper (GSAP scroll) ─────────────────────────────
function DesktopScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: any;
    let mounted = true;

    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!mounted) return;
      ScrollTrigger.getAll().forEach((t) => t.kill());
      await new Promise((r) => setTimeout(r, 60));
      if (!mounted) return;

      ctx = gsap.context(() => {
        const track = trackRef.current;
        const section = sectionRef.current;
        if (!track || !section) return;
        const getTotal = () => track.scrollWidth - window.innerWidth;
        gsap.set(track, { x: 0 });

        gsap.to(track, {
          x: () => -getTotal(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getTotal()}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.to(".hs-progress-bar", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getTotal()}`,
            scrub: true,
          },
        });

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${getTotal()}`,
          onUpdate: (self) => {
            const cur = Math.min(
              Math.ceil(self.progress * slides.length) || 1,
              slides.length,
            );
            const el = document.querySelector(".hs-counter-current");
            if (el) el.textContent = String(cur).padStart(2, "0");
          },
        });
      }, sectionRef);
    }

    init();
    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden h-screen"
    >
      {/* Számláló */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3 pointer-events-none mix-blend-difference">
        <span className="hs-counter-current font-['Cormorant_Garamond'] text-3xl font-light text-white tabular-nums">
          01
        </span>
        <div className="w-px h-10 bg-white/30" />
        <span className="font-['Cormorant_Garamond'] text-lg font-light text-white/40">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/5 z-30">
        <div className="hs-progress-bar h-full bg-[#C8A882] origin-left scale-x-0" />
      </div>

      {/* Track */}
      <div ref={trackRef} className="flex h-full will-change-transform">
        {slides.map((slide, i) => (
          <DesktopSlide key={i} slide={slide} />
        ))}
      </div>
    </section>
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
            <div
              key={i}
              className="relative overflow-hidden py-14 px-5"
              style={{ backgroundColor: slide.bg }}
            >
              <div
                className="absolute pointer-events-none select-none font-['Cormorant_Garamond'] font-light"
                style={{
                  fontSize: "9rem",
                  color: isDark
                    ? "rgba(200,168,130,0.05)"
                    : "rgba(200,168,130,0.08)",
                  lineHeight: 0.9,
                  bottom: "-0.5rem",
                  right: "0.75rem",
                }}
              >
                {slide.number}
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-5 h-px"
                    style={{ background: slide.accent }}
                  />
                  <span
                    className="text-[9px] tracking-[0.2em] uppercase"
                    style={{ color: slide.accent }}
                  >
                    {slide.number} / {String(slides.length).padStart(2, "0")}
                  </span>
                </div>
                <h2
                  className={`font-['Cormorant_Garamond'] font-light leading-[0.95] tracking-tighter mb-2 ${isDark ? "text-white" : "text-[#1A1510]"}`}
                  style={{ fontSize: "clamp(2.2rem, 9vw, 3.5rem)" }}
                >
                  {slide.title}
                </h2>
                <p
                  className={`font-['Cormorant_Garamond'] text-[0.95rem] font-light italic mb-3 ${isDark ? "text-white/40" : "text-[#A08060]"}`}
                >
                  {slide.subtitle}
                </p>
                <p
                  className={`text-[13px] font-light leading-relaxed mb-5 ${isDark ? "text-white/60" : "text-[#7A6A58]"}`}
                >
                  {slide.description}
                </p>

                <div
                  className="flex gap-3 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-none snap-x snap-mandatory items-end"
                  style={{ height: "220px" }}
                >
                  {slide.images.map((img, j) => {
                    const w = Math.round(200 * img.aspect);
                    if (img.type === "video") {
                      return (
                        <div
                          key={j}
                          className="snap-start flex-shrink-0 relative overflow-hidden cursor-pointer group"
                          style={{ height: 200, width: w }}
                          onClick={() => setVideoId(img.youtubeId)}
                        >
                          <img
                            src={`https://i.ytimg.com/vi/${img.youtubeId}/maxresdefault.jpg`}
                            alt={img.alt}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = img.src;
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full border-2 border-white/50 bg-white/10 flex items-center justify-center">
                              <svg
                                viewBox="0 0 24 24"
                                fill="white"
                                className="w-4 h-4 ml-0.5"
                              >
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                            </div>
                          </div>
                          <div
                            className="absolute bottom-0 left-0 right-0 px-2 py-1.5 flex items-center justify-between"
                            style={{
                              background:
                                "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                            }}
                          >
                            <span className="text-[8px] tracking-[0.1em] uppercase text-white/80">
                              {img.label}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={j}
                        className="snap-start flex-shrink-0 relative overflow-hidden"
                        style={{ height: 200, width: w }}
                      >
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          className="object-cover object-top"
                          sizes="300px"
                          quality={80}
                        />
                      </div>
                    );
                  })}
                </div>

                <div
                  className={`flex items-center justify-between pt-5 mt-3 border-t ${isDark ? "border-white/10" : "border-black/5"}`}
                >
                  <div>
                    <div
                      className="font-['Cormorant_Garamond'] text-[2.5rem] font-light"
                      style={{ color: slide.accent }}
                    >
                      {slide.stat.n}
                    </div>
                    <div className="text-[8px] tracking-widest uppercase opacity-50">
                      {slide.stat.l}
                    </div>
                  </div>
                  <Link
                    href={slide.href}
                    className={`text-[10px] tracking-widest uppercase border-b pb-0.5 ${isDark ? "text-white/60 border-white/20" : "text-[#1A1510]/70 border-[#1A1510]/20"}`}
                  >
                    Részletek →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {videoId && (
        <VideoModal videoId={videoId} onClose={() => setVideoId(null)} />
      )}
    </>
  );
}

export default function HorizontalScrollSection() {
  return (
    <main className="bg-white">
      <div className="hidden lg:block">
        <DesktopScroll />
      </div>
      <MobileSlides />
    </main>
  );
}
