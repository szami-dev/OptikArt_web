"use client";

import { useEffect, useRef } from "react";

const timeline = [
  {
    step: "01",
    title: "Kapcsolatfelvétel",
    desc: "Írj nekünk és 24 órán belül visszajelzünk. Megbeszéljük az alapokat és megnézzük, hogy szabad-e a dátumotok.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Egyeztetés",
    desc: "Személyes vagy online találkozón megismerjük az elképzeléseiteket, a helyszínt és a nap menetét.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Foglalás",
    desc: "30% foglaló befizetésével biztosítjátok a dátumot. A maradék összeget az esemény előtt egyenlítitek ki.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "A nagy nap",
    desc: "Mi gondoskodunk arról, hogy minden pillanatot megörökítsünk. Ti csak élvezzétek a napotokat.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    step: "05",
    title: "Átadás",
    desc: "Szerkesztett képek és videók digitálisan, határidőre. A legjobb pillanatok 48 órán belül megérkeznek.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-6 h-6">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    ),
  },
];

export default function WeddingTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let ctx: any;
    let mounted = true;

    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!mounted) return;

      ctx = gsap.context(() => {

        // ── Fejléc animáció ─────────────────────────────────
        gsap.fromTo(".wt-header > *",
          { opacity: 0, y: 24 },
          {
            opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power3.out",
            immediateRender: false,
            scrollTrigger: { trigger: ".wt-header", start: "top 80%", toggleActions: "play none none reverse" },
          }
        );

        // ── Progress vonal – scrub-bal húzódik végig ────────
        gsap.fromTo(progressLineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            transformOrigin: "left center",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 60%",
              end: "bottom 70%",
              scrub: 0.6,
            },
          }
        );

        // ── Minden pont és kártya a saját pozíciójánál aktiválódik ──
        timeline.forEach((_, i) => {
          const dot = dotRefs.current[i];
          const card = cardRefs.current[i];
          if (!dot || !card) return;

          // A pont a progress arányán aktiválódik
          const progress = i / (timeline.length - 1);

          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top 60%",
            end: "bottom 70%",
            scrub: true,
            onUpdate: (self) => {
              const active = self.progress >= progress - 0.05;
              // Pont
              if (active) {
                dot.classList.add("is-active");
              } else {
                dot.classList.remove("is-active");
              }
              // Kártya opacity a közeledéssel arányos
              const cardProgress = Math.max(0, Math.min(1, (self.progress - (progress - 0.1)) / 0.15));
              gsap.set(card, { opacity: Math.max(0.25, cardProgress), y: (1 - cardProgress) * 20 });
            },
          });
        });

        // ── Kártyák kezdeti állapota ─────────────────────────
        cardRefs.current.forEach((card, i) => {
          if (card) gsap.set(card, { opacity: i === 0 ? 0.25 : 0.15, y: 20 });
        });

      }, sectionRef);
    }

    init();
    return () => { mounted = false; ctx?.revert(); };
  }, []);

  return (
    <section ref={sectionRef} className="py-28 bg-[#FAF8F4] border-y border-[#EDE8E0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">

        {/* Fejléc */}
        <div className="wt-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-20">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#C8A882]" />
              <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">Hogyan működik</span>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.1] text-[#1A1510]">
              Az együttműködés<br />
              <em className="not-italic text-[#C8A882]">lépései</em>
            </h2>
          </div>
          <p className="max-w-xs text-[13px] text-[#7A6A58] leading-[1.8] sm:text-right">
            Görgess végig a folyamaton — minden lépés automatikusan megjelenik.
          </p>
        </div>

        {/* ── DESKTOP: vízszintes sticky timeline ── */}
        <div className="hidden lg:block">

          {/* Vonal + pontok */}
          <div className="relative mb-16">
            {/* Alap vonal (szürke) */}
            <div className="absolute top-[10px] left-0 right-0 h-px bg-[#EDE8E0]" />

            {/* Progress vonal (arany, scrub-bal) */}
            <div
              ref={progressLineRef}
              className="absolute top-[10px] left-0 right-0 h-px bg-[#C8A882] origin-left"
              style={{ transform: "scaleX(0)" }}
            />

            {/* Pontok */}
            <div className="relative grid grid-cols-5">
              {timeline.map((step, i) => (
                <div key={i} className="flex flex-col items-center">
                  {/* Pont */}
                  <div
                    ref={(el) => { dotRefs.current[i] = el; }}
                    className="timeline-dot relative w-5 h-5 border-2 bg-white transition-all duration-500"
                    style={{ borderColor: "#EDE8E0" }}
                  >
                    <div className="timeline-dot-inner absolute inset-[3px] bg-[#C8A882] scale-0 transition-transform duration-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kártyák */}
          <div className="grid grid-cols-5 gap-6">
            {timeline.map((step, i) => (
              <div
                key={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="flex flex-col"
              >
                {/* Ikon */}
                <div className="w-10 h-10 border border-[#EDE8E0] flex items-center justify-center text-[#C8A882] mb-4 transition-all duration-500 timeline-card-icon">
                  {step.icon}
                </div>

                <div className="text-[9px] tracking-[0.18em] uppercase text-[#C8A882] mb-2">{step.step}</div>
                <h3 className="font-['Cormorant_Garamond'] text-[1.25rem] font-light text-[#1A1510] mb-2 leading-tight">
                  {step.title}
                </h3>
                <p className="text-[12px] text-[#7A6A58] leading-[1.8]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── MOBIL: vertikális timeline ── */}
        <div className="lg:hidden flex flex-col gap-0">
          {timeline.map((step, i) => (
            <div key={i} className="flex gap-5">
              {/* Bal oldal: vonal + pont */}
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 border-2 border-[#C8A882] bg-white flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 bg-[#C8A882]" />
                </div>
                {i < timeline.length - 1 && (
                  <div className="w-px flex-1 bg-[#EDE8E0] my-2 min-h-[60px]" />
                )}
              </div>

              {/* Tartalom */}
              <div className="pb-10 flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 border border-[#EDE8E0] flex items-center justify-center text-[#C8A882]">
                    {step.icon}
                  </div>
                  <span className="text-[9px] tracking-[0.18em] uppercase text-[#C8A882]">{step.step}</span>
                </div>
                <h3 className="font-['Cormorant_Garamond'] text-[1.3rem] font-light text-[#1A1510] mb-1.5">{step.title}</h3>
                <p className="text-[12px] text-[#7A6A58] leading-[1.8]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS a pont aktiválásához */}
      <style jsx>{`
        .timeline-dot.is-active {
          border-color: #C8A882 !important;
        }
        .timeline-dot.is-active .timeline-dot-inner {
          transform: scale(1) !important;
        }
      `}</style>
    </section>
  );
}