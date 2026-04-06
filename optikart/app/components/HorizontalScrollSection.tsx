"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    id: "eskuvo",
    number: "01",
    title: "Esküvő",
    subtitle: "A ti történetetek, örökre.",
    description: "Professzionális esküvői fotózás és videózás, amely megőrzi a nagy nap minden pillanatát — természetes, időtlen stílusban.",
    href: "/weddings",
    tags: ["Fotózás", "Videózás", "Highlight film"],
    theme: "light" as const,
    bg: "#FAF8F4",
    accent: "#C8A882",
    images: [
      { src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", alt: "Esküvői pár", aspect: "tall" },
      { src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80", alt: "Menyasszony", aspect: "square" },
      { src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80", alt: "Virágok", aspect: "wide" },
    ],
    stat: { n: "120+", l: "Esküvő" },
  },
  {
    id: "portre",
    number: "02",
    title: "Portré",
    subtitle: "Pillantások — arcok, pillanatok, emlékek.",
    description: "Páros, jegyes, családi és egyéni portré fotózás. Természetes fényben, valódi pillanatokból — mert minden arc mesél valamit.",
    href: "/portrait",
    tags: ["Páros", "Családi", "Egyéni portré"],
    theme: "light" as const,
    bg: "#FFFFFF",
    accent: "#C8A882",
    images: [
      { src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80", alt: "Portré", aspect: "tall" },
      { src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80", alt: "Nő portré", aspect: "square" },
      { src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80", alt: "Férfi portré", aspect: "wide" },
    ],
    stat: { n: "350+", l: "Portré" },
  },
  {
    id: "rendezvenyek",
    number: "03",
    title: "Rendezvény",
    subtitle: "Minden pillanat számít.",
    description: "Céges rendezvény, fesztivál, party vagy konferencia — mi ott vagyunk és megörökítjük az energiát. Gyors, precíz, profi.",
    href: "/events",
    tags: ["Céges", "Fesztivál", "Magán"],
    theme: "dark" as const,
    bg: "#1A1410",
    accent: "#C8A882",
    images: [
      { src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", alt: "Konferencia", aspect: "wide" },
      { src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80", alt: "Koncert", aspect: "tall" },
      { src: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80", alt: "Party", aspect: "square" },
    ],
    stat: { n: "80+", l: "Rendezvény" },
  },
  {
    id: "marketing",
    number: "04",
    title: "Marketing",
    subtitle: "Content, ami megállít.",
    description: "Professzionális fotó és short-form videó tartalom — Instagram, TikTok, Facebook. Amit az algoritmus szeret és az emberek megnéznek.",
    href: "/marketing",
    tags: ["Instagram", "TikTok", "Brand film"],
    theme: "light" as const,
    bg: "#FAF8F4",
    accent: "#1A1510",
    images: [
      { src: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80", alt: "Termékfotó", aspect: "square" },
      { src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80", alt: "Brand", aspect: "tall" },
      { src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80", alt: "Social", aspect: "wide" },
    ],
    stat: { n: "500+", l: "Poszt/hó" },
  },
  {
    id: "dron",
    number: "05",
    title: "Drón",
    subtitle: "A világ felülnézetből egészen más.",
    description: "Légifotók és videók, amelyek új perspektívát adnak — engedéllyel, profi felszereléssel, 6K felbontásban.",
    href: "/gallery",
    tags: ["Légifotó", "6K videó", "Engedéllyel"],
    theme: "dark" as const,
    bg: "#0C0A08",
    accent: "#C8A882",
    images: [
      { src: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80", alt: "Drón", aspect: "wide" },
      { src: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80", alt: "Légifotó", aspect: "tall" },
      { src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80", alt: "Táj", aspect: "wide" },
    ],
    stat: { n: "6K", l: "Felbontás" },
  },
];

const aspectSizes: Record<string, { basis: string; minH: string }> = {
  tall:   { basis: "150px", minH: "240px" },
  square: { basis: "180px", minH: "180px" },
  wide:   { basis: "260px", minH: "150px" },
};

function SlideImage({ img, accent, theme }: {
  img: { src: string; alt: string; aspect: string };
  accent: string;
  theme: "dark" | "light";
}) {
  const [hovered, setHovered] = useState(false);
  const sz = aspectSizes[img.aspect];

  return (
    <div
      className="relative overflow-hidden flex-shrink-0 cursor-pointer"
      style={{ flexBasis: sz.basis, flexGrow: 1, minHeight: sz.minH, maxHeight: "260px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image src={img.src} alt={img.alt} fill className={`object-cover transition-transform duration-700 ${hovered ? "scale-105" : "scale-100"}`} sizes="200px" />
      <div className={`absolute inset-0 transition-opacity duration-400 ${hovered ? "opacity-100" : "opacity-0"}`}
        style={{ background: `linear-gradient(to top, ${accent}60, transparent)` }} />
    </div>
  );
}

// ── Desktop horizontal scroll ─────────────────────────────────
function DesktopScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: any;

    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const track = trackRef.current;
        const section = sectionRef.current;
        if (!track || !section) return;

        const getTotal = () => track.scrollWidth - window.innerWidth;

        const tl = gsap.timeline({
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

        tl.to(track, { x: () => -getTotal(), ease: "none" });

        gsap.to(".hs-progress-bar", {
          scaleX: 1, ease: "none",
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
          scrub: true,
          onUpdate: (self) => {
            const current = Math.min(Math.ceil(self.progress * slides.length) || 1, slides.length);
            const el = document.querySelector(".hs-counter-current");
            if (el) el.textContent = String(current).padStart(2, "0");
          },
        });
      }, sectionRef);
    }

    init();
    return () => ctx?.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden" style={{ height: "100vh" }}>
      {/* Számláló */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none mix-blend-difference">
        <span className="hs-counter-current font-['Cormorant_Garamond'] text-2xl font-light text-white">01</span>
        <div className="w-px h-8 bg-white/30" />
        <span className="font-['Cormorant_Garamond'] text-base font-light text-white/40">{String(slides.length).padStart(2, "0")}</span>
      </div>

      {/* Progress */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-black/10 z-20">
        <div className="hs-progress-bar h-full bg-[#C8A882] origin-left" style={{ transform: "scaleX(0)" }} />
      </div>

      {/* Track */}
      <div ref={trackRef} className="flex h-full will-change-transform" style={{ width: `${slides.length * 100}vw` }}>
        {slides.map((slide, i) => {
          const isDark = slide.theme === "dark";
          const textMain = isDark ? "text-white" : "text-[#1A1510]";
          const textSub = isDark ? "text-white/50" : "text-[#7A6A58]";
          const textMuted = isDark ? "text-white/25" : "text-[#A08060]";
          const borderColor = isDark ? "border-white/10" : "border-[#EDE8E0]";

          return (
            <div key={i} className="relative flex-shrink-0 w-screen h-full flex flex-col justify-center overflow-hidden" style={{ backgroundColor: slide.bg }}>
              {/* Háttér dekor szám */}
              <div className="absolute pointer-events-none select-none font-['Cormorant_Garamond'] font-light"
                style={{ fontSize: "clamp(12rem, 22vw, 22rem)", color: isDark ? "rgba(200,168,130,0.04)" : "rgba(200,168,130,0.07)", lineHeight: 0.85, bottom: "-2rem", right: "4rem" }}>
                {slide.number}
              </div>

              {slide.id === "marketing" && (
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(#C8A882 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />
              )}

              <div className="relative z-10 w-full px-12 lg:px-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                  <div className="lg:col-span-5">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-px" style={{ background: slide.accent }} />
                      <span className="text-[10px] tracking-[0.25em] uppercase font-light" style={{ color: slide.accent }}>
                        {slide.number} / {String(slides.length).padStart(2, "0")}
                      </span>
                    </div>
                    <h2 className={`font-['Cormorant_Garamond'] font-light leading-[0.95] tracking-[-0.02em] mb-3 ${textMain}`}
                      style={{ fontSize: "clamp(2.8rem, 5vw, 5.5rem)" }}>
                      {slide.title}
                    </h2>
                    <p className={`font-['Cormorant_Garamond'] text-[1.1rem] font-light italic ${textMuted}`}>{slide.subtitle}</p>
                  </div>

                  <div className="lg:col-span-5 lg:col-start-7 flex flex-col justify-end gap-5">
                    <p className={`text-[13px] font-light leading-[1.9] ${textSub}`}>{slide.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {slide.tags.map(tag => (
                        <span key={tag} className="text-[9px] tracking-[0.12em] uppercase px-3 py-1.5 border"
                          style={{ color: slide.accent, borderColor: `${slide.accent}35` }}>{tag}</span>
                      ))}
                    </div>
                    <div className={`flex items-center justify-between pt-4 border-t ${borderColor}`}>
                      <div>
                        <div className="font-['Cormorant_Garamond'] text-[1.8rem] font-light leading-none" style={{ color: slide.accent }}>{slide.stat.n}</div>
                        <div className={`text-[9px] tracking-[0.12em] uppercase mt-0.5 ${textMuted}`}>{slide.stat.l}</div>
                      </div>
                      <Link href={slide.href} className={`inline-flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase border-b pb-0.5 transition-all ${isDark ? "text-white/60 border-white/20 hover:text-white hover:border-white/50" : "text-[#1A1510] border-[#C8A882]/40 hover:border-[#C8A882]"}`}>
                        Részletek
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 items-end overflow-hidden" style={{ maxHeight: "270px" }}>
                  {slide.images.map((img, j) => (
                    <SlideImage key={j} img={img} accent={slide.accent} theme={slide.theme} />
                  ))}
                </div>
              </div>

              <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: `linear-gradient(to bottom, transparent, ${slide.accent}40, transparent)` }} />
            </div>
          );
        })}
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 pointer-events-none">
        <div className="w-6 h-px bg-[#C8A882]/40" />
        <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]/50">Görgets jobbra</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-4 h-4 text-[#C8A882]/40">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </section>
  );
}

// ── Mobil vertikális kártyák ──────────────────────────────────
function MobileSlides() {
  return (
    <div className="lg:hidden flex flex-col">
      {slides.map((slide, i) => {
        const isDark = slide.theme === "dark";
        const textMain = isDark ? "text-white" : "text-[#1A1510]";
        const textSub = isDark ? "text-white/50" : "text-[#7A6A58]";
        const textMuted = isDark ? "text-white/30" : "text-[#A08060]";
        const borderColor = isDark ? "border-white/10" : "border-[#EDE8E0]";

        return (
          <div key={i} className="relative overflow-hidden py-12 px-6 sm:px-10" style={{ backgroundColor: slide.bg }}>
            {/* Dekor szám */}
            <div className="absolute pointer-events-none select-none font-['Cormorant_Garamond'] font-light opacity-60"
              style={{ fontSize: "10rem", color: isDark ? "rgba(200,168,130,0.05)" : "rgba(200,168,130,0.08)", lineHeight: 0.9, bottom: "-1rem", right: "1rem" }}>
              {slide.number}
            </div>

            <div className="relative z-10">
              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px" style={{ background: slide.accent }} />
                <span className="text-[9px] tracking-[0.22em] uppercase font-light" style={{ color: slide.accent }}>
                  {slide.number} / {String(slides.length).padStart(2, "0")}
                </span>
              </div>

              {/* Cím */}
              <h2 className={`font-['Cormorant_Garamond'] font-light leading-[0.95] tracking-[-0.02em] mb-2 ${textMain}`}
                style={{ fontSize: "clamp(2.4rem, 10vw, 4rem)" }}>
                {slide.title}
              </h2>
              <p className={`font-['Cormorant_Garamond'] text-[1rem] font-light italic mb-4 ${textMuted}`}>{slide.subtitle}</p>
              <p className={`text-[13px] font-light leading-[1.8] mb-5 ${textSub}`}>{slide.description}</p>

              {/* Tagek */}
              <div className="flex flex-wrap gap-2 mb-6">
                {slide.tags.map(tag => (
                  <span key={tag} className="text-[9px] tracking-[0.1em] uppercase px-2.5 py-1.5 border"
                    style={{ color: slide.accent, borderColor: `${slide.accent}35` }}>{tag}</span>
                ))}
              </div>

              {/* Képek – vízszintes scroll */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 sm:-mx-10 sm:px-10 scrollbar-none snap-x snap-mandatory">
                {slide.images.map((img, j) => (
                  <div key={j} className="relative overflow-hidden flex-shrink-0 rounded-sm snap-start" style={{ width: "160px", height: "200px" }}>
                    <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="160px" />
                  </div>
                ))}
              </div>

              {/* Stat + link */}
              <div className={`flex items-center justify-between pt-5 mt-5 border-t ${borderColor}`}>
                <div>
                  <div className="font-['Cormorant_Garamond'] text-[1.6rem] font-light leading-none" style={{ color: slide.accent }}>{slide.stat.n}</div>
                  <div className={`text-[8px] tracking-[0.12em] uppercase mt-0.5 ${textMuted}`}>{slide.stat.l}</div>
                </div>
                <Link href={slide.href} className={`inline-flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase border-b pb-0.5 transition-all ${isDark ? "text-white/60 border-white/20" : "text-[#1A1510] border-[#C8A882]/40"}`}>
                  Részletek →
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HorizontalScrollSection() {
  return (
    <>
      {/* Desktop: horizontal pin scroll */}
      <div className="hidden lg:block">
        <DesktopScroll />
      </div>

      {/* Mobil: egyszerű vertikális stack – GSAP nélkül, nincs overlap */}
      <MobileSlides />
    </>
  );
}