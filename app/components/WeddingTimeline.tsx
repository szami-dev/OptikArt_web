"use client";

// app/components/WeddingTimeline.tsx

import { useEffect, useRef, useState } from "react";

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

const N = timeline.length;

export default function WeddingTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const stRef = useRef<any>(null);
  const [active, setActive] = useState(0);

  // Kattintás a lépésre → odagörget a pinelt szakaszban
  const go = (i: number) => {
    const st = stRef.current;
    if (!st) return;
    const y = st.start + ((i + 0.5) / N) * (st.end - st.start);
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    let ctx: any;
    let mounted = true;

    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!mounted) return;

      ctx = gsap.context(() => {
        // Fejléc
        gsap.fromTo(
          ".wt-header > *",
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: ".wt-header",
              start: "top 85%",
              once: true,
            },
          },
        );

        const mm = gsap.matchMedia();

        // Desktop: a szekció „megáll", és görgetésre lépésről lépésre halad
        mm.add("(min-width: 1024px)", () => {
          const st = ScrollTrigger.create({
            trigger: sectionRef.current,
            pin: true,
            start: "top top",
            end: () => "+=" + window.innerHeight * (N * 0.7),
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const idx = Math.min(N - 1, Math.floor(self.progress * N));
              setActive(idx);
            },
          });
          stRef.current = st;
          return () => {
            stRef.current = null;
          };
        });

        // Mobil: lépések beúsznak görgetéskor
        mm.add("(max-width: 1023px)", () => {
          gsap.utils.toArray<HTMLElement>(".wt-m-item").forEach((el) => {
            gsap.fromTo(
              el,
              { autoAlpha: 0, y: 30 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                immediateRender: false,
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              },
            );
          });
          gsap.fromTo(
            ".wt-m-line",
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              transformOrigin: "top center",
              scrollTrigger: {
                trigger: ".wt-m-wrap",
                start: "top 70%",
                end: "bottom 70%",
                scrub: true,
              },
            },
          );
        });
      }, sectionRef);
    }

    init();
    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

  const cur = timeline[active];

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-0 lg:h-screen lg:flex lg:flex-col lg:justify-center bg-[#FAF8F4] border-y border-[#EDE8E0] overflow-hidden"
    >
      <div className="relative w-full max-w-7xl mx-auto px-8 lg:px-16">
        {/* Fejléc */}
        <div className="wt-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16 lg:mb-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[#C8A882]" />
              <span className="text-[10px] tracking-[0.22em] uppercase text-[#A08060]">
                Hogyan működik
              </span>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-[clamp(2.2rem,4vw,3.5rem)] font-light leading-[1.1] text-[#1A1510]">
              Az együttműködés
              <br />
              <em className="not-italic text-[#C8A882]">lépései</em>
            </h2>
          </div>
          <p className="max-w-xs text-[13px] text-[#7A6A58] leading-[1.8] sm:text-right">
            Görgess végig a folyamaton — minden lépés automatikusan megjelenik.
          </p>
        </div>

        {/* ── DESKTOP: pinelt, lépésenként váltó színpad ── */}
        <div className="hidden lg:block">
          <div className="relative grid grid-cols-12 gap-10 items-center min-h-[300px] mb-12">
            {/* Vízjel ikon */}
            <div
              key={`ghost-${active}`}
              aria-hidden
              className="wt-ghost pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-72 h-72 text-[#C8A882] opacity-[0.07] [&_svg]:w-full [&_svg]:h-full [&_svg]:[stroke-width:0.5]"
            >
              {cur.icon}
            </div>

            {/* Nagy sorszám */}
            <div className="col-span-5 relative overflow-hidden">
              <div
                key={`num-${active}`}
                className="wt-num font-['Cormorant_Garamond'] font-thin leading-[0.9] tracking-[-0.04em] text-transparent select-none"
                style={{
                  fontSize: "clamp(8rem, 16vw, 15rem)",
                  WebkitTextStroke: "1px #C8A882",
                }}
              >
                {cur.step}
              </div>
            </div>

            {/* Tartalom */}
            <div className="col-span-7 relative">
              <div key={`txt-${active}`} className="wt-txt">
                <div className="w-12 h-12 border border-[#C8A882]/50 flex items-center justify-center text-[#C8A882] mb-6 relative">
                  {cur.icon}
                  <span className="absolute -top-px -left-px w-2 h-2 border-t border-l border-[#C8A882]" />
                  <span className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-[#C8A882]" />
                </div>
                <h3
                  className="font-['Cormorant_Garamond'] font-light text-[#1A1510] leading-[1.05] mb-5"
                  style={{ fontSize: "clamp(2rem, 3.6vw, 3.4rem)" }}
                >
                  {cur.title}
                </h3>
                <p className="text-[14px] sm:text-[15px] text-[#7A6A58] leading-[1.9] max-w-lg font-light">
                  {cur.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Léptető sáv */}
          <div className="relative">
            <div className="absolute top-[10px] left-[10%] right-[10%] h-px bg-[#EDE8E0]" />
            <div
              className="absolute top-[10px] left-[10%] right-[10%] h-px bg-[#C8A882] origin-left transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.2,1)]"
              style={{ transform: `scaleX(${active / (N - 1)})` }}
            />
            <div className="relative grid grid-cols-5">
              {timeline.map((s, i) => {
                const on = i === active;
                const done = i < active;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => go(i)}
                    aria-current={on ? "step" : undefined}
                    className="group flex flex-col items-center gap-4 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#C8A882]/60"
                  >
                    <span
                      className={`relative w-5 h-5 border-2 bg-white transition-all duration-500 ${
                        on || done
                          ? "border-[#C8A882]"
                          : "border-[#EDE8E0] group-hover:border-[#C8A882]/60"
                      } ${on ? "scale-125" : ""}`}
                    >
                      <span
                        className={`absolute inset-[3px] bg-[#C8A882] transition-transform duration-500 ${
                          on || done ? "scale-100" : "scale-0"
                        }`}
                      />
                    </span>
                    <span
                      className={`font-['Cormorant_Garamond'] text-[1.1rem] leading-none transition-colors duration-500 ${
                        on
                          ? "text-[#1A1510]"
                          : "text-[#A08060]/60 group-hover:text-[#A08060]"
                      }`}
                    >
                      {s.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── MOBIL: vertikális timeline ── */}
        <div className="wt-m-wrap relative lg:hidden flex flex-col gap-0">
          <div className="absolute left-[9px] top-2 bottom-8 w-px bg-[#EDE8E0]">
            <div className="wt-m-line w-full h-full bg-[#C8A882] origin-top" />
          </div>
          {timeline.map((step, i) => (
            <div key={i} className="wt-m-item relative flex gap-5">
              <div className="flex flex-col items-center">
                <div className="relative z-10 w-5 h-5 border-2 border-[#C8A882] bg-white flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 bg-[#C8A882]" />
                </div>
              </div>

              <div className="pb-10 flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 border border-[#EDE8E0] flex items-center justify-center text-[#C8A882]">
                    {step.icon}
                  </div>
                  <span className="text-[9px] tracking-[0.18em] uppercase text-[#C8A882]">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-['Cormorant_Garamond'] text-[1.5rem] font-light text-[#1A1510] mb-1.5">
                  {step.title}
                </h3>
                <p className="text-[13px] text-[#7A6A58] leading-[1.8]">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes wt-num-in {
          from {
            transform: translateY(60%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes wt-txt-in {
          from {
            transform: translateY(24px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes wt-ghost-in {
          from {
            transform: translateY(-50%) rotate(-10deg) scale(0.85);
            opacity: 0;
          }
          to {
            transform: translateY(-50%) rotate(0deg) scale(1);
            opacity: 0.07;
          }
        }
        .wt-num {
          animation: wt-num-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        .wt-txt {
          animation: wt-txt-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s both;
        }
        .wt-ghost {
          animation: wt-ghost-in 1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .wt-num,
          .wt-txt,
          .wt-ghost {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}