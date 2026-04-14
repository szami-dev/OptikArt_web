"use client";

// app/components/WeddingHero.tsx
// FIX: navbar magasság offset a tartalom elején

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_H = 68;

export default function WeddingHero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ctx: any;
    let mounted = true;

    async function init() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!mounted) return;

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(
          ".wh-bg-img",
          { scale: 1.06 },
          { scale: 1, duration: 2.2, ease: "power2.out" },
        )
          .fromTo(
            ".wh-line-left",
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 1,
              ease: "power3.out",
              transformOrigin: "top center",
            },
            0.4,
          )
          .fromTo(
            ".wh-eyebrow",
            { opacity: 0, x: -16 },
            { opacity: 1, x: 0, duration: 0.7 },
            0.8,
          )
          .fromTo(
            ".wh-title-line",
            { opacity: 0, y: 50, skewY: 1.5 },
            { opacity: 1, y: 0, skewY: 0, stagger: 0.12, duration: 1 },
            1.0,
          )
          .fromTo(
            ".wh-cta-item",
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 },
            1.5,
          )
          .fromTo(
            ".wh-side-panel",
            { opacity: 0, x: 24 },
            { opacity: 1, x: 0, duration: 0.9 },
            1.2,
          )
          .fromTo(
            ".wh-bottom-item",
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, stagger: 0.08, duration: 0.5 },
            1.7,
          );

        gsap.to(".wh-bg-img", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
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
      className="relative w-full overflow-hidden bg-[#0D0B08]"
      style={{ height: "100svh", minHeight: "600px" }}
    >
      {/* Háttérkép */}
      <div
        className="absolute inset-x-0 overflow-hidden"
        style={{ top: "-5%", bottom: "-5%" }}
      >
        <div className="wh-bg-img absolute inset-0 will-change-transform">
          <Image
            src="/gallery/wedding/kreativ-52.JPG"
            alt="Esküvői fotó"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
            quality={85}
          />
        </div>
      </div>

      {/* Gradiens */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `
          linear-gradient(105deg, rgba(13,11,8,0.93) 0%, rgba(13,11,8,0.65) 42%, rgba(13,11,8,0.18) 75%, rgba(13,11,8,0.08) 100%),
          linear-gradient(to top, rgba(13,11,8,0.75) 0%, transparent 35%)
        `,
        }}
      />

      {/* Tartalom */}
      <div
        className="relative z-[2] flex flex-col w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16"
        style={{ height: "100%" }}
      >
        {/* Felső sor – navbar alól indul */}
        <div
          className="flex items-start gap-5"
          style={{ paddingTop: `${NAV_H + 12}px` }}
        >
          <div
            className="wh-line-left w-px bg-[#C8A882]/40 origin-top shrink-0"
            style={{ height: "72px" }}
          />
          <div className="wh-eyebrow opacity-0 flex flex-col gap-1 pt-1">
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#C8A882]/70">
              OptikArt Studio
            </span>
            <span className="text-[9px] tracking-[0.3em] uppercase text-white/30">
              Esküvői fotó & videó
            </span>
          </div>
        </div>

        {/* Középső */}
        <div className="flex-1 flex items-center py-8">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end">
            <div className="lg:col-span-8 xl:col-span-7">
              <div
                className="font-['Cormorant_Garamond'] font-thin text-white leading-[0.85] tracking-[-0.03em]"
                style={{ fontSize: "clamp(3.2rem, 7.5vw, 10.5rem)" }}
              >
                <div className="wh-title-line opacity-0 overflow-hidden">
                  <span className="block">A ti</span>
                </div>
                <div className="wh-title-line opacity-0 overflow-hidden">
                  <span className="block">történetetek</span>
                </div>
                <div className="wh-title-line opacity-0 overflow-hidden">
                  <em className="block not-italic" style={{ color: "#C8A882" }}>
                    örökre.
                  </em>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <Link
                  href="/contact"
                  className="wh-cta-item opacity-0 bg-white text-[#1A1510] text-[11px] tracking-[0.18em] uppercase px-7 py-3.5 hover:bg-[#C8A882] hover:text-white transition-all duration-300 whitespace-nowrap"
                >
                  Időpont egyeztetés
                </Link>
                <a
                  href="#csomagok"
                  className="wh-cta-item opacity-0 text-[11px] tracking-[0.14em] uppercase text-white/50 border-b border-white/20 pb-0.5 hover:text-white hover:border-white/50 transition-all duration-200 whitespace-nowrap"
                >
                  Csomagok →
                </a>
              </div>
            </div>

            <div className="wh-side-panel opacity-0 lg:col-span-4 xl:col-span-5 flex flex-col gap-5 lg:pb-1">
              <p className="text-[13px] font-light text-white/50 leading-[1.9] max-w-xs">
                Professzionális esküvői fotózás és videózás, amely megőrzi a
                nagy nap minden pillanatát — természetes, időtlen stílusban.
              </p>
              <div className="flex gap-6 py-4 border-t border-white/10">
                {[
                  { n: "120+", l: "Esküvő" },
                  { n: "8 év", l: "Tapasztalat" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-['Cormorant_Garamond'] text-[1.8rem] font-light text-[#C8A882] leading-none">
                      {s.n}
                    </div>
                    <div className="text-[8px] tracking-[0.15em] uppercase text-white/30 mt-1">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alsó sor – mindig látszik */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-8 sm:pb-10 flex-shrink-0">
          <div className="flex items-end gap-6 sm:gap-8">
            <div className="wh-bottom-item opacity-0 hidden sm:flex items-center gap-3">
              <div className="w-px h-8 bg-white/15 shrink-0" />
              <div>
                <div className="text-[8px] tracking-[0.15em] uppercase text-white/25">
                  Referencia
                </div>
                <div className="text-[11px] text-white/40 font-['Cormorant_Garamond'] italic">
                  Vivi & Bence · Kecskemét, 2025
                </div>
              </div>
            </div>
            <div className="wh-bottom-item opacity-0 flex flex-col items-center gap-2">
              <span className="text-[8px] tracking-[0.22em] uppercase text-white/25">
                Scroll
              </span>
              <div className="w-px h-10 bg-gradient-to-b from-[#C8A882]/40 to-transparent animate-[scrollPulse_2s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      </div>

      {/* Jobb dekor */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-3 z-[2]">
        <div className="w-px h-14 bg-gradient-to-b from-transparent to-[#C8A882]/20" />
        <div className="w-1 h-1 rounded-full bg-[#C8A882]/40" />
        <span
          className="text-[7px] tracking-[0.3em] uppercase text-white/20"
          style={{ writingMode: "vertical-rl" }}
        >
          Budapest · Hungary
        </span>
        <div className="w-1 h-1 rounded-full bg-[#C8A882]/40" />
        <div className="w-px h-14 bg-gradient-to-b from-[#C8A882]/20 to-transparent" />
      </div>

      <style jsx>{`
        @keyframes scrollPulse {
          0% {
            transform: scaleY(0);
            opacity: 1;
            transform-origin: top;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
            transform-origin: top;
          }
          51% {
            transform-origin: bottom;
          }
          100% {
            transform: scaleY(0);
            opacity: 0;
            transform-origin: bottom;
          }
        }
      `}</style>
    </section>
  );
}
