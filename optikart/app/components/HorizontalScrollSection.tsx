"use client";

import { useEffect, useRef } from "react";

const slides = [
  {
    number: "01",
    title: "Fotózás",
    description:
      "Portré, termék, esemény és architectural fotózás. Minden kép egy gondosan megkomponált pillanat — a fény, az árnyék és az érzelem tökéletes egyensúlya.",
    tags: ["RAW feldolgozás", "Retusálás", "Helyszíni konzultáció"],
    accent: "#C8A882",
    bg: "#FAF8F4",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-16 h-16">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Videógyártás",
    description:
      "Reklámfilm, dokumentumfilm, social media content — komplex gyártástól a posztprodukcióig. Képek, amelyek mozognak és érzelmeket keltenek.",
    tags: ["4K · 6K felbontás", "Color grading", "Motion graphics"],
    accent: "#A08060",
    bg: "#F5EFE6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-16 h-16">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Drón felvételek",
    description:
      "Légifotók és videók, amelyek új perspektívát adnak — engedéllyel, profi felszereléssel. A világ felülnézetből egészen más.",
    tags: ["Engedéllyel", "6K felbontás", "GPS pontosság"],
    accent: "#B89870",
    bg: "#EDE8E0",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-16 h-16">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Projektek",
    description:
      "Komplex alkotói projektek, ahol fotó és videó kéz a kézben dolgozik. Kampányoktól márkafilmekig — egy csapattal, egy vízióval.",
    tags: ["Kampányok", "Márkafilmek", "Éves szerződés"],
    accent: "#C8A882",
    bg: "#FAF8F4",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-16 h-16">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function HorizontalScrollSection() {
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

        // !! FONTOS: Minden tartalmat láthatóvá teszünk ELŐSZÖR
        // Soha ne animáljuk opacity-val a fő tartalmat
        gsap.set(".hscroll-card-content", { opacity: 1, y: 0, clearProps: "all" });

        const getTotal = () => track.scrollWidth - window.innerWidth;

        // ── Fő pin + vízszintes mozgás ────────────────────────
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getTotal()}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => {
              // Refresh után újra láthatóvá tesszük a tartalmat
              gsap.set(".hscroll-card-content", { clearProps: "all" });
            },
          },
        });

        tl.to(track, {
          x: () => -getTotal(),
          ease: "none",
        });

        // ── Progress bar ──────────────────────────────────────
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

        // ── Slide counter ─────────────────────────────────────
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${getTotal()}`,
          scrub: true,
          onUpdate: (self) => {
            const current = Math.min(
              Math.ceil(self.progress * slides.length) || 1,
              slides.length
            );
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
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100vh" }}
    >
      {/* Bal – vertikális felirat */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3 pointer-events-none">
        <span
          className="text-[9px] tracking-[0.3em] uppercase text-[#A08060]/50"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Szolgáltatások
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-[#C8A882]/30 to-transparent" />
      </div>

      {/* Jobb – számláló */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
        <span className="hs-counter-current font-['Cormorant_Garamond'] text-2xl font-light text-[#C8A882]">
          01
        </span>
        <div className="w-px h-8 bg-[#DDD5C8]" />
        <span className="font-['Cormorant_Garamond'] text-base font-light text-[#C8B8A0]/50">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* Görgets hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 pointer-events-none">
        <div className="w-8 h-px bg-[#C8A882]/30" />
        <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]/40">
          Görgets jobbra
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-4 h-4 text-[#C8A882]/30">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#EDE8E0] z-20">
        <div
          className="hs-progress-bar h-full bg-[#C8A882] origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="flex h-full will-change-transform"
        style={{ width: `${slides.length * 100}vw` }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="hscroll-card relative flex-shrink-0 w-screen h-full flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: slide.bg }}
          >
            {/* Dekoratív háttérszám */}
            <div
              className="absolute right-16 bottom-0 font-['Cormorant_Garamond'] font-light select-none pointer-events-none"
              style={{
                fontSize: "clamp(10rem, 22vw, 20rem)",
                color: "rgba(200,168,130,0.06)",
                lineHeight: 0.85,
              }}
            >
              {slide.number}
            </div>

            {/* Tartalom – opacity és visibility explicit beállítva */}
            <div
              className="hscroll-card-content relative z-10 max-w-2xl mx-auto px-20 lg:px-28 w-full"
              style={{ opacity: 1, visibility: "visible" }}
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-px" style={{ background: slide.accent }} />
                <span
                  className="text-[10px] tracking-[0.25em] uppercase font-light"
                  style={{ color: slide.accent }}
                >
                  {slide.number} / {String(slides.length).padStart(2, "0")}
                </span>
              </div>

              {/* Ikon */}
              <div className="mb-8" style={{ color: slide.accent, opacity: 1 }}>
                {slide.icon}
              </div>

              {/* Cím */}
              <h2
                className="font-['Cormorant_Garamond'] font-light leading-[1] tracking-[-0.02em] text-[#1A1510] mb-6"
                style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)" }}
              >
                {slide.title}
              </h2>

              {/* Leírás */}
              <p className="text-[14px] font-light text-[#7A6A58] leading-[1.9] max-w-md mb-8">
                {slide.description}
              </p>

              {/* Tagek */}
              <div className="flex flex-wrap gap-2 mb-10">
                {slide.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] tracking-[0.12em] uppercase px-4 py-1.5 border"
                    style={{ color: slide.accent, borderColor: `${slide.accent}40` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <a
                href="#"
                className="inline-flex items-center gap-3 text-[11px] tracking-[0.15em] uppercase text-[#1A1510] border-b border-[#C8A882]/40 pb-0.5 hover:border-[#C8A882] transition-all duration-200"
              >
                Bővebben
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>

            {/* Jobb oldali sáv */}
            <div
              className="absolute right-0 top-0 bottom-0 w-1"
              style={{
                background: `linear-gradient(to bottom, transparent, ${slide.accent}25, transparent)`,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}