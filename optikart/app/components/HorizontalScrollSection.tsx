"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// ── Minden slide-hoz saját médiaanyag ────────────────────────
// Cseréld ki a src értékeket a sajátjaidra!
const slides = [
  {
    number: "01",
    title: "Fotózás",
    description:
      "Portré, termék, esemény és architectural fotózás. Minden kép egy gondosan megkomponált pillanat — a fény, az árnyék és az érzelem tökéletes egyensúlya.",
    tags: ["RAW feldolgozás", "Retusálás", "Helyszíni konzultáció"],
    accent: "#C8A882",
    bg: "#FAF8F4",
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=75",
        alt: "Esküvői fotó",
        aspect: "tall",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=75",
        alt: "Portré",
        aspect: "square",
      },
      {
        type: "video",
        src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=75",
        alt: "Videó preview",
        aspect: "wide",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=75",
        alt: "Esemény",
        aspect: "square",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=75",
        alt: "Termékfotó",
        aspect: "tall",
      },
    ],
  },
  {
    number: "02",
    title: "Videógyártás",
    description:
      "Reklámfilm, dokumentumfilm, social media content — komplex gyártástól a posztprodukcióig. Képek, amelyek mozognak és érzelmeket keltenek.",
    tags: ["4K · 6K felbontás", "Color grading", "Motion graphics"],
    accent: "#A08060",
    bg: "#F5EFE6",
    media: [
      {
        type: "video",
        src: "https://images.unsplash.com/photo-1601506521793-dc748fc80b67?w=600&q=75",
        alt: "Reklámfilm",
        aspect: "wide",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=75",
        alt: "Forgatás",
        aspect: "tall",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=600&q=75",
        alt: "Stúdió",
        aspect: "square",
      },
      {
        type: "video",
        src: "https://images.unsplash.com/photo-1536240478700-b869ad10e128?w=600&q=75",
        alt: "Motion",
        aspect: "square",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&q=75",
        alt: "Color grade",
        aspect: "wide",
      },
    ],
  },
  {
    number: "03",
    title: "Drón felvételek",
    description:
      "Légifotók és videók, amelyek új perspektívát adnak — engedéllyel, profi felszereléssel. A világ felülnézetből egészen más.",
    tags: ["Engedéllyel", "6K felbontás", "GPS pontosság"],
    accent: "#B89870",
    bg: "#EDE8E0",
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=75",
        alt: "Drón",
        aspect: "wide",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=75",
        alt: "Légifotó",
        aspect: "tall",
      },
      {
        type: "video",
        src: "https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=600&q=75",
        alt: "Drón videó",
        aspect: "square",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=75",
        alt: "Táj",
        aspect: "square",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600&q=75",
        alt: "Felülnézet",
        aspect: "wide",
      },
    ],
  },
  {
    number: "04",
    title: "Projektek",
    description:
      "Komplex alkotói projektek, ahol fotó és videó kéz a kézben dolgozik. Kampányoktól márkafilmekig — egy csapattal, egy vízióval.",
    tags: ["Kampányok", "Márkafilmek", "Éves szerződés"],
    accent: "#C8A882",
    bg: "#FAF8F4",
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=75",
        alt: "Kampány",
        aspect: "tall",
      },
      {
        type: "video",
        src: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=75",
        alt: "Márkafilm",
        aspect: "wide",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=75",
        alt: "Projekt",
        aspect: "square",
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=75",
        alt: "Csapat",
        aspect: "square",
      },
      {
        type: "video",
        src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=75",
        alt: "Behind scenes",
        aspect: "tall",
      },
    ],
  },
];

// aspect → magasság arány a justified gridben
const aspectHeights: Record<string, string> = {
  tall: "h-64",
  square: "h-44",
  wide: "h-36",
};

function MediaItem({
  item,
  accent,
}: {
  item: (typeof slides)[0]["media"][0];
  accent: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative overflow-hidden group cursor-pointer flex-shrink-0 ${aspectHeights[item.aspect]}`}
      style={{
        flexBasis:
          item.aspect === "wide"
            ? "280px"
            : item.aspect === "tall"
              ? "160px"
              : "200px",
        flexGrow: 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={item.src}
        alt={item.alt}
        fill
        className={`object-cover transition-transform duration-700 ${hovered ? "scale-105" : "scale-100"}`}
        sizes="200px"
      />

      {/* Video overlay */}
      {item.type === "video" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${hovered ? "scale-110" : "scale-100"}`}
            style={{ background: `${accent}cc`, backdropFilter: "blur(4px)" }}
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 ml-0.5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      )}

      {/* Hover overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `linear-gradient(to top, ${accent}50, transparent)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Label */}
      <div
        className={`absolute bottom-2 left-3 transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        <span className="text-[9px] tracking-[0.12em] uppercase text-white/90">
          {item.alt}
        </span>
      </div>
    </div>
  );
}

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

        gsap.set(".hscroll-card-content", { opacity: 1, clearProps: "all" });

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
            onRefresh: () =>
              gsap.set(".hscroll-card-content", { clearProps: "all" }),
          },
        });

        tl.to(track, { x: () => -getTotal(), ease: "none" });

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
          scrub: true,
          onUpdate: (self) => {
            const current = Math.min(
              Math.ceil(self.progress * slides.length) || 1,
              slides.length,
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
      {/* Bal felirat */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3 pointer-events-none">
        <span
          className="text-[9px] tracking-[0.3em] uppercase text-[#A08060]/50"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Szolgáltatások
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-[#C8A882]/30 to-transparent" />
      </div>

      {/* Jobb számláló */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
        <span className="hs-counter-current font-['Cormorant_Garamond'] text-2xl font-light text-[#C8A882]">
          01
        </span>
        <div className="w-px h-8 bg-[#DDD5C8]" />
        <span className="font-['Cormorant_Garamond'] text-base font-light text-[#C8B8A0]/50">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 pointer-events-none">
        <div className="w-8 h-px bg-[#C8A882]/30" />
        <span className="text-[9px] tracking-[0.2em] uppercase text-[#A08060]/40">
          Görgets jobbra
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="w-4 h-4 text-[#C8A882]/30"
        >
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
            className="hscroll-card relative flex-shrink-0 w-screen h-full flex flex-col justify-center overflow-hidden"
            style={{ backgroundColor: slide.bg }}
          >
            {/* Dekoratív háttérszám */}
            <div
              className="absolute right-16 bottom-0 font-['Cormorant_Garamond'] font-light select-none pointer-events-none"
              style={{
                fontSize: "clamp(10rem, 18vw, 18rem)",
                color: "rgba(200,168,130,0.05)",
                lineHeight: 0.85,
              }}
            >
              {slide.number}
            </div>

            <div
              className="hscroll-card-content relative z-10 w-full px-16 lg:px-24"
              style={{ opacity: 1, visibility: "visible" }}
            >
              {/* Felső sor: eyebrow + cím + leírás + tagek */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-8 h-px"
                      style={{ background: slide.accent }}
                    />
                    <span
                      className="text-[10px] tracking-[0.25em] uppercase font-light"
                      style={{ color: slide.accent }}
                    >
                      {slide.number} / {String(slides.length).padStart(2, "0")}
                    </span>
                  </div>
                  <h2
                    className="font-['Cormorant_Garamond'] font-light leading-[1] tracking-[-0.02em] text-[#1A1510]"
                    style={{ fontSize: "clamp(2.5rem, 4.5vw, 5rem)" }}
                  >
                    {slide.title}
                  </h2>
                </div>

                <div className="lg:col-span-5 lg:col-start-7 flex flex-col justify-end">
                  <p className="text-[13px] font-light text-[#7A6A58] leading-[1.9] mb-5">
                    {slide.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slide.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] tracking-[0.12em] uppercase px-3 py-1.5 border"
                        style={{
                          color: slide.accent,
                          borderColor: `${slide.accent}40`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Justified galéria sor */}
              <div
                className="flex gap-2 items-end overflow-hidden"
                style={{ maxHeight: "280px" }}
              >
                {slide.media.map((item, j) => (
                  <MediaItem key={j} item={item} accent={slide.accent} />
                ))}
              </div>

              {/* CTA */}
              <div className="mt-6">
                <a
                  href="#"
                  className="inline-flex items-center gap-3 text-[11px] tracking-[0.15em] uppercase text-[#1A1510] border-b border-[#C8A882]/40 pb-0.5 hover:border-[#C8A882] transition-all duration-200"
                >
                  Bővebben
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-3 h-3"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Oldalsáv */}
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
